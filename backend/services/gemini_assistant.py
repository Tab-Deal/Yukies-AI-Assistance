from dataclasses import dataclass, field
import re
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from backend.config import settings
from backend.schemas import ProductCardSchema
from backend.services.guardrails import (
    analyze_customer_input,
    get_standard_handover_text,
    sanitize_ai_response,
)
from backend.services.knowledge_engine import kb_engine
from backend.services.shopify_client import shopify_client


class GeminiStructuredDecision(BaseModel):
    reply_text: str = Field(
        ...,
        description="Polite, warm, concise response (max 3-5 sentences unless step-by-step guide). NO EMOJIS. Must follow 09_formulierungen.md strictly.",
    )
    recommended_handles: list[str] = Field(
        default_factory=list,
        description="List of relevant YUKIES Shopify product handles to display as read-only product cards (e.g. 'yukies-body-butter', 'yukies-baby-oil', 'yukies-sugarscrub', 'yukies-tummy-stick', 'yukies-mild-hair-body-wash-150ml', 'burste', 'geschenksbox').",
    )
    trigger_handover: bool = Field(
        default=False,
        description="True if the question touches an [OFFEN] topic, cannot be answered with certainty from the KB, or requires human support from Silvia & Barbara.",
    )
    handover_reason: str | None = Field(
        default=None,
        description="Short German reason if trigger_handover is True.",
    )


@dataclass
class AssistantTurnResult:
    reply_text: str
    language: str
    address_form: str
    referenced_products: list[ProductCardSchema] = field(default_factory=list)
    handover_triggered: bool = False
    handover_reason: str | None = None
    guardrail_notes: dict = field(default_factory=dict)


class YukiesGeminiAssistant:
    """Orchestrates Google GenAI (gemini-2.5-flash) with 3-Layer YUKIES Guardrails."""

    def __init__(self) -> None:
        self._client: genai.Client | None = None

    def _get_client(self) -> genai.Client | None:
        api_key = settings.GEMINI_API_KEY.strip()
        if not api_key:
            return None
        if self._client is None:
            if api_key.startswith("AQ."):
                self._client = genai.Client(vertexai=True, api_key=api_key)
            else:
                self._client = genai.Client(api_key=api_key)
        return self._client

    def _build_system_instruction(
        self,
        *,
        customer_name: str,
        customer_email: str,
        is_logged_in: bool,
        language: str,
        address_form: str,
        live_catalog_summary: str,
        order_context: str,
    ) -> str:
        return f"""{kb_engine.system_prompt_md}

--- HÖCHSTE PRIORITÄT: ERLAUBTE UND VERBOTENE FORMULIERUNGEN (09_formulierungen.md) ---
{kb_engine.formulierungen_md}

--- STRIKTE ROLLEN-GRENZEN (NICHT-AKTIONIERBARER BERATER) ---
- Du bist ein reiner Beratungs- und Kundenservice-Assistent (Read-Only Shopping Companion).
- Du kannst KEINE Produkte in den Warenkorb legen, nichts aus dem Warenkorb löschen und keinen Checkout durchführen. Verweise stattdessen freundlich auf die Produktkarte bzw. den direkten Produktlink im Shop (yukies.at).
- Du kannst KEIN Kundenkonto erstellen oder ändern.
- Du erfindest NIEMALS Rabattcodes. Es gibt aktuell KEINE Rabattcodes. Nenne nur offizielle Beigaben (Begrüßungskarte bei jeder Bestellung, 3 Duftwachse à 5 g bei der ersten Bestellung, ab 70 € Bestellwert 1 Tummy Stick solange der Vorrat reicht – nie fest versprechen) sowie Gratisversand ab 50 € (AT, EU, CH).
- Verwende NIEMALS Emojis.
- Antworte in der Sprache der Kundin ({language.upper()}). Im Deutschen verwende konsequent die Ansprache "{address_form}".
- Antworte kurz und präzise: höchstens 3–5 Sätze (außer bei Schritt-für-Schritt-Anleitungen wie der Trockenbürste).
- Beratungsfragen zu Schwangerschaft, Stillzeit (Body Butter) und Neugeborenen (Babyöl, Tummy Stick) gehören zu deinen Standard-Kompetenzen (trigger_handover = false). Setze trigger_handover NUR auf true, wenn ein echtes [OFFEN] Thema, eine Reklamation, ein Defekt oder der Wunsch nach einem Menschen vorliegt.

--- KUNDEN-KONTEXT ---
- Name: {customer_name}
- E-Mail: {customer_email}
- Im Shopify-Konto eingeloggt: {"Ja" if is_logged_in else "Nein (Gast mit DSGVO-Einwilligung)"}

--- LIVE SHOPIFY PRODUKTKATALOG & PREISE (yukies.at) ---
{live_catalog_summary}

--- LIVE BESTELLSTATUS-KONTEXT ---
{order_context}

--- VOLLSTÄNDIGE GEPRÜFTE YUKIES WISSENSBASIS ---
{kb_engine.full_kb_text}
"""

    async def _detect_relevant_handles_from_text(
        self, text: str
    ) -> list[ProductCardSchema]:
        all_prods = await shopify_client.get_all_products()
        lower = text.lower()
        matched: list[ProductCardSchema] = []
        keyword_map = {
            "yukies-body-butter": [
                "body butter", "bodybutter", "shea coco", "sheabutter",
                "schwangerschaft", "stillzeit", "pregnancy", "stretch",
                "grossesse", "vergetures", "beurre corporel",
                "gravidanza", "smagliature", "burro corpo",
            ],
            "yukies-baby-oil": [
                "babyöl", "baby oil", "babyoel", "mandelöl", "windelbereich",
                "weiße stücke", "white flakes", "huile bébé", "amande douce",
                "flocons blancs", "olio baby", "olio bambini", "mandorle dolci", "pezzetti bianchi",
            ],
            "yukies-sugarscrub": [
                "sugar scrub", "sugarscrub", "zuckerpeeling", "peeling",
                "rose vanilla", "rosenblüten", "braun", "gommage", "sucre", "esfoliante",
            ],
            "yukies-tummy-stick": [
                "tummy stick", "tummystick", "bauchmassage", "kakaobutter",
                "bauch", "bäuchlein", "tummy", "massage ventre", "pancino", "massaggio pancia",
            ],
            "yukies-mild-hair-body-wash-150ml": [
                "hair & body wash", "wasch-gel", "waschgel", "body wash",
                "haare", "shampoo", "gel lavant", "corps et cheveux", "bagnetto", "detergente",
            ],
            "burste": [
                "trockenbürste", "bürste", "dry brush", "tampico", "lymphdrainage",
                "brosse à sec", "spazzola a secco", "spazzola",
            ],
            "geschenksbox": [
                "geschenkbox", "geschenksbox", "mama & baby box", "mama-baby box",
                "gift box", "geschenk", "coffret cadeau", "confezione regalo",
            ],
        }
        prod_by_handle = {p.handle: p for p in all_prods}
        for handle, keywords in keyword_map.items():
            if any(k in lower for k in keywords) and handle in prod_by_handle:
                matched.append(prod_by_handle[handle])
        return matched[:3]

    async def _knowledge_fallback_response(
        self,
        *,
        user_message: str,
        language: str,
        address_form: str,
        order_lookup_result: dict | None,
    ) -> tuple[str, list[str], bool, str | None]:
        """Deterministic verified KB engine response if Cloud LLM is unreachable."""
        lower = user_message.lower()

        # 1. Check non-actionable boundaries (cart, account, custom discount)
        if any(
            w in lower
            for w in [
                "wie lange",
                "how long",
                "combien de temps",
                "quanto tempo",
                "stored",
                "gespeichert",
                "conservé",
                "conservate",
                "speicherdauer",
                "chat history",
                "chatverlauf",
                "dsgvo",
                "gdpr",
                "rgpd",
                "datenschutz",
            ]
        ) and any(
            w in lower
            for w in ["chat", "daten", "data", "données", "dati", "history", "verlauf", "stored", "gespeichert", "dsgvo", "gdpr", "rgpd"]
        ):
            if language == "fr":
                return (
                    "Avec votre consentement explicite au début de l'échange, votre nom, adresse e-mail et historique de chat sont conservés sous un identifiant unique conformément au RGPD et à la loi autrichienne (DSG) pendant 6 mois (180 jours), puis automatiquement supprimés. Vous pouvez demander l'effacement ou l'exportation de vos données à tout moment à office@bacciorganics.com.",
                    [],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Con il tuo esplicito consenso all'inizio della chat, il tuo nome, indirizzo e-mail e la cronologia della conversazione vengono conservati sotto un identificativo utente univoco in conformità al GDPR e alla legge austriaca (DSG) per 6 mesi (180 giorni) e poi eliminati automaticamente. Puoi richiedere la cancellazione o l'esportazione dei tuoi dati in qualsiasi momento scrivendo a office@bacciorganics.com.",
                    [],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "With your explicit consent at the start of the chat, your name, email address, and chat history are stored under a unique User ID in accordance with the EU GDPR and the Austrian Data Protection Act (DSG) for 6 months (180 days) and then automatically deleted. You can request immediate deletion or an export of your data at any time by contacting office@bacciorganics.com.",
                    [],
                    False,
                    None,
                )
            return (
                "Nach deiner ausdrücklichen Zustimmung zu Beginn des Chats werden dein Name, deine E-Mail-Adresse und der Gesprächsverlauf unter einer eindeutigen Benutzerkennung (User-ID) gemäß DSGVO und österreichischem DSG für 6 Monate (180 Tage) gespeichert und danach automatisch gelöscht. Du kannst jederzeit unter office@bacciorganics.com die sofortige Löschung oder einen Export deiner Daten anfordern.",
                [],
                False,
                None,
            )

        if any(
            w in lower
            for w in [
                "in den warenkorb",
                "warenkorb legen",
                "add to cart",
                "ajouter au panier",
                "au panier",
                "metti nel carrello",
                "aggiungi al carrello",
                "carrello",
                "aus dem warenkorb",
                "konto erstellen",
                "create an account",
                "créer un compte",
                "crea un account",
                "account anlegen",
            ]
        ):
            prods = await self._detect_relevant_handles_from_text(user_message)
            handles = [p.handle for p in prods]
            if language == "fr":
                return (
                    "En tant que conseiller YUKIES, je ne peux pas ajouter directement des produits à votre panier ni créer de compte client. "
                    "Vous pouvez ouvrir le produit directement via le lien ci-dessous, l'ajouter à votre panier sur yukies.at et procéder au paiement.",
                    handles,
                    False,
                    None,
                )
            if language == "it":
                return (
                    "In qualità di assistente YUKIES, non posso inserire direttamente i prodotti nel carrello né creare un account cliente per te. "
                    "Puoi aprire il prodotto direttamente tramite il link in basso, aggiungerlo al carrello su yukies.at e procedere all'acquisto.",
                    handles,
                    False,
                    None,
                )
            if language == "en":
                return (
                    "As your YUKIES shopping advisor, I cannot directly add or remove items in your cart or create an account for you. "
                    "You can open the product directly via the link below, add it to your cart on yukies.at, and proceed to checkout.",
                    handles,
                    False,
                    None,
                )
            if address_form == "Sie":
                return (
                    "Als Ihr beratender Assistent kann ich Produkte nicht direkt in Ihren Warenkorb legen oder ein Kundenkonto anlegen. "
                    "Sie können das gewünschte Produkt direkt über die Produktkarte unten im Shop öffnen und dort in den Warenkorb legen.",
                    handles,
                    False,
                    None,
                )
            return (
                "Als dein beratender Assistent kann ich Produkte nicht direkt in deinen Warenkorb legen oder ein Kundenkonto erstellen. "
                "Du kannst das gewünschte Produkt direkt über die Produktkarte unten im Shop öffnen und dort ganz einfach in den Warenkorb legen.",
                handles,
                False,
                None,
            )

        # 2. Discount / Rabattcode inquiry
        if any(w in lower for w in ["rabatt", "rabattcode", "gutscheincode", "discount", "promo code", "coupon", "code promo", "remise", "sconto", "codice sconto"]):
            if language == "fr":
                return (
                    "Il n'y a actuellement aucun code promotionnel actif. Cependant, chaque commande comprend une carte de bienvenue Yukies, votre première commande reçoit 3 cires parfumées (5 g chacune) en cadeau, et dès 70 € d'achat, vous recevez un Tummy Stick en cadeau dans la limite des stocks disponibles (avec la livraison gratuite à partir de 50 € en Autriche, dans l'UE et en Suisse).",
                    ["geschenksbox"],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Al momento non ci sono codici sconto attivi. Tuttavia, ogni ordine include un biglietto di benvenuto Yukies, il tuo primo ordine riceve 3 cere profumate (5 g ciascuna) in regalo, e a partire da 70 € di spesa ricevi un Tummy Stick in omaggio fino a esaurimento scorte (con spedizione gratuita da 50 € per Austria, UE e Svizzera).",
                    ["geschenksbox"],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "There are currently no active discount codes. However, every order includes a Yukies greeting card, your first order comes with 3 wax melts (5 g each) as a gift, and orders over 70 € receive a free Tummy Stick while supplies last (plus free shipping from 50 € in Austria, the EU, and Switzerland).",
                    ["geschenksbox"],
                    False,
                    None,
                )
            return (
                "Aktuell gibt es keinen aktiven Rabattcode. Bei deiner ersten Bestellung erhältst du jedoch 3 Duftwachse à 5 g als Geschenk, ab 50 € Bestellwert ist der Versand nach Österreich, in die EU und die Schweiz kostenlos, und ab 70 € Bestellwert legen wir einen Tummy Stick als Geschenk bei, solange der Vorrat reicht.",
                ["geschenksbox"],
                False,
                None,
            )

        # 3. Order status inquiry
        if order_lookup_result is not None:
            if not order_lookup_result.get("authorized", True):
                return (order_lookup_result["message"], [], False, None)
            if order_lookup_result.get("found"):
                ord_info = order_lookup_result["orders"][0]
                tracking_part = (
                    f" Sendungsnummer: {ord_info['tracking_number']}."
                    if ord_info.get("tracking_number")
                    else ""
                )
                if language == "en":
                    return (
                        f"Your order {ord_info['order_number']} ({ord_info['total_price']}) has the status: {ord_info['fulfillment_status']}.{tracking_part}",
                        [],
                        False,
                        None,
                    )
                return (
                    f"Deine Bestellung {ord_info['order_number']} ({ord_info['total_price']}) hat aktuell den Status: {ord_info['fulfillment_status']}.{tracking_part}",
                    [],
                    False,
                    None,
                )
            return (order_lookup_result["message"], [], False, None)

        # 4. Sugar Scrub brown color FAQ
        if ("sugar scrub" in lower or "peeling" in lower or "gommage" in lower) and (
            "braun" in lower or "brown" in lower or "brun" in lower or "marrone" in lower or "rosa" in lower or "schlecht" in lower
        ):
            if language == "fr":
                return (
                    "Rassurez-vous, votre Sugar Scrub est en parfait état. Nous n'utilisons aucun stabilisateur de couleur chimique : le gommage contient de véritables pétales de rose moulus qui foncent naturellement au contact de la lumière et de l'oxygène, tout comme des roses séchées. La qualité, l'efficacité et le parfum restent intacts.",
                    ["yukies-sugarscrub"],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Non preoccuparti, il tuo Sugar Scrub è in perfette condizioni. Non utilizziamo stabilizzanti chimici di colore: lo scrub contiene veri petali di rosa macinati che scuriscono naturalmente a contatto con luce e ossigeno, proprio come le rose essiccate. Qualità, efficacia e profumo rimangono inalterati.",
                    ["yukies-sugarscrub"],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "No worries, your Sugar Scrub is in perfect condition. We do not use any artificial color stabilizers, and the real ground rose petals naturally darken to a warm brown when exposed to light and oxygen—just like dried roses. Quality, effect, and scent remain unchanged.",
                    ["yukies-sugarscrub"],
                    False,
                    None,
                )
            return (
                "Keine Sorge, dein Sugar Scrub ist in bester Ordnung. Wir verzichten komplett auf chemische Farbstabilisatoren: Das Peeling enthält echte, gemahlene Rosenblüten, die bei Kontakt mit Licht und Sauerstoff ganz natürlich nachdunkeln – genau wie getrocknete Rosen. Qualität, Wirkung und Duft bleiben gleich.",
                ["yukies-sugarscrub"],
                False,
                None,
            )

        # 5. White flakes in Baby Oil FAQ
        if ("babyöl" in lower or "baby oil" in lower or "huile" in lower or "olio" in lower) and (
            "weiß" in lower or "weisse" in lower or "stücke" in lower or "flocken" in lower or "white" in lower or "flocons" in lower or "pezzetti" in lower or "bianchi" in lower
        ):
            if language == "fr":
                return (
                    "Ce n'est pas un défaut : il s'agit d'huile de coco bio cristallisée, ce qui est typique d'un produit naturel pur. La qualité de votre huile pour bébé reste parfaitement intacte.",
                    ["yukies-baby-oil"],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Non è un difetto: si tratta di olio di cocco biologico cristallizzato, assolutamente tipico per un prodotto naturale puro. La qualità del tuo olio baby rimane inalterata.",
                    ["yukies-baby-oil"],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "That is not a defect: the white flakes are crystallized organic coconut oil, which is typical for a pure natural product. The quality of your Baby Oil remains completely unchanged.",
                    ["yukies-baby-oil"],
                    False,
                    None,
                )
            return (
                "Das ist kein Fehler: Es handelt sich um kristallisiertes Bio-Kokosöl, was typisch für ein reines Naturprodukt ist. Die Qualität deines Babyöls bleibt vollkommen gleich.",
                ["yukies-baby-oil"],
                False,
                None,
            )

        # 6. Dry Brush (Trockenbürste) application
        if "trockenbürste" in lower or "bürste" in lower or "dry brush" in lower or "brosse" in lower or "spazzola" in lower:
            if language == "fr":
                return (
                    "Brossez toujours en direction du cœur pour un drainage lymphatique cosmétique : commencez par la plante des pieds en mouvements longs et doux vers le haut, puis brossez les bras des mains vers les aisselles, le ventre en cercles doux dans le sens des aiguilles d'une montre, et le dos vers les épaules. Une pression douce suffit.",
                    ["burste"],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Spazzola sempre verso il cuore per un drenaggio linfatico cosmetico: inizia dalla pianta dei piedi con movimenti lunghi e delicati verso l'alto, poi spazzola le braccia dalle mani verso le ascelle, la pancia con movimenti circolari in senso orario e la schiena verso le spalle. È sufficiente una pressione delicata.",
                    ["burste"],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "Always brush toward the heart for cosmetic lymphatic drainage: start at the soles of your feet in long, gentle strokes upward over calves and thighs, then brush arms from hands toward armpits, the belly in gentle clockwise circles, and back/hips upward toward the shoulders. Gentle pressure is sufficient; avoid sensitive areas, open wounds, fresh scars, and sunburn.",
                    ["burste"],
                    False,
                    None,
                )
            return (
                "Immer in Richtung Herz bürsten (kosmetische Lymphdrainage): an den Fußsohlen beginnen und in langen, sanften Zügen nach oben Richtung Hüfte bürsten, dann die Arme von den Händen Richtung Achseln, den Bauch sanft kreisend im Uhrzeigersinn sowie Rücken und Po nach oben Richtung Schultern. Sanfter Druck reicht; empfindliche Stellen, Wunden, frische Narben und Sonnenbrand bitte aussparen.",
                ["burste"],
                False,
                None,
            )

        # 7. Shipping & Delivery
        if any(w in lower for w in ["versand", "lieferzeit", "shipping", "delivery", "retoure", "rückgabe", "widerruf", "livraison", "frais de port", "spedizione", "reso", "tempi di consegna"]):
            if language == "fr":
                return (
                    "Nous expédions avec la Poste autrichienne sous 1 à 2 jours ouvrables après réception du paiement. La livraison coûte 4,90 € en Autriche (1–2 jours), 10,90 € dans l'UE (2–4 jours) et 16,90 € en Suisse (5–10 jours); la livraison est offerte dès 50 € d'achat en Autriche, dans l'UE et en Suisse. Les produits scellés peuvent être retournés dans un délai de 14 jours.",
                    [],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Spediamo con la Posta austriaca entro 1–2 giorni lavorativi dalla ricezione del pagamento. La spedizione costa 4,90 € in Austria (1–2 giorni), 10,90 € nell'UE (2–4 giorni) e 16,90 € in Svizzera (5–10 giorni); la spedizione è gratuita a partire da 50 € di spesa per Austria, UE e Svizzera. I prodotti non aperti e sigillati possono essere resi entro 14 giorni.",
                    [],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "We ship via Austrian Post within 1–2 business days after payment receipt. Shipping costs 4,90 € in Austria (1–2 business days), 10,90 € in the EU (2–4 business days), and 16,90 € to Switzerland (5–10 business days), with free shipping on orders from 50 € in Austria, the EU, and Switzerland. Unopened, originally sealed products can be returned within 14 days.",
                    [],
                    False,
                    None,
                )
            return (
                "Wir versenden mit der Österreichischen Post innerhalb von 1–2 Werktagen nach Zahlungseingang. Der Versand kostet in Österreich 4,90 € (1–2 Werktage), in der EU 10,90 € (2–4 Werktage) und in die Schweiz 16,90 € (5–10 Werktage); ab 50 € Bestellwert ist der Versand für Österreich, die EU und die Schweiz kostenlos. Ungeöffnete, originalversiegelte Produkte können innerhalb von 14 Tagen widerrufen werden.",
                [],
                False,
                None,
            )

        # 8. Pregnancy / Mama recommendations
        if any(w in lower for w in ["schwanger", "schwangerschaft", "stillzeit", "mama", "pregnant", "pregnancy", "body butter", "grossesse", "enceinte", "allaitement", "gravidanza", "allattamento"]):
            if language == "fr":
                return (
                    "Pour la grossesse et l'allaitement, nous recommandons notre Body Butter Shea Coco 100 % bio (25,90 €) : sans parfum ni huiles essentielles, il prend soin de la peau pendant qu'elle s'étire et soutient son élasticité naturelle. Vous pouvez également l'associer à notre Sugar Scrub Rose Vanilla et à la brosse à sec.",
                    ["yukies-body-butter", "burste", "geschenksbox"],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "Per la gravidanza, il post-parto e l'allattamento consigliamo il nostro Body Butter Shea Coco 100% bio (25,90 €): privo di profumo e oli essenziali, sostiene la naturale elasticità della pelle e se ne prende cura mentre si distende. Puoi abbinarlo anche al nostro Sugar Scrub Rose Vanilla e alla spazzola a secco.",
                    ["yukies-body-butter", "burste", "geschenksbox"],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "For pregnancy, postpartum, and breastfeeding, we recommend our 100% organic Body Butter Shea Coco (25,90 €), which supports natural skin elasticity and cares for your skin as it stretches—completely free of perfume and essential oils. You can also combine it with our Sugar Scrub Rose Vanilla and Dry Brush, or choose the Mama & Baby Gift Box.",
                    ["yukies-body-butter", "burste", "geschenksbox"],
                    False,
                    None,
                )
            return (
                "Für die Schwangerschaft, das Wochenbett und die Stillzeit empfehlen wir unsere 100 % Bio Body Butter Shea Coco (25,90 €): Sie ist frei von Parfum und ätherischen Ölen, unterstützt die natürliche Elastizität der Haut und pflegt die Haut, während sie sich dehnt. Auch unser Babyöl, das Mild Hair & Body Wash, das Sugar Scrub und die Trockenbürste sind in der Schwangerschaft geeignet.",
                ["yukies-body-butter", "burste", "geschenksbox"],
                False,
                None,
            )

        # 9. Baby products / Newborn recommendations
        if any(w in lower for w in ["baby", "neugeboren", "geburt", "newborn", "tummy", "bauch", "bébé", "bebe", "naissance", "bambino", "neonato", "pancia"]):
            if language == "fr":
                return (
                    "Nos soins pour bébé s'utilisent dès la naissance et sont sans parfum ni huiles essentielles : l'Huile pour bébé Amande douce Coco (29,90 €) dorlote délicatement la peau, le Tummy Stick au beurre de cacao bio (14,90 €) est idéal pour un massage doux du ventre, et le Mild Hair & Body Wash (19,90 €) nettoie en douceur.",
                    ["yukies-baby-oil", "yukies-tummy-stick", "yukies-mild-hair-body-wash-150ml"],
                    False,
                    None,
                )
            if language == "it":
                return (
                    "I nostri prodotti per neonati possono essere usati fin dalla nascita e sono privi di profumo e oli essenziali: l'Olio Baby Mandorla Dolce Cocco (29,90 €) nutre delicatamente la pelle, il Tummy Stick al burro di cacao bio (14,90 €) è ideale per un massaggio delicato al pancino, e il Mild Hair & Body Wash (19,90 €) deterge con estrema delicatezza.",
                    ["yukies-baby-oil", "yukies-tummy-stick", "yukies-mild-hair-body-wash-150ml"],
                    False,
                    None,
                )
            if language == "en":
                return (
                    "Our baby care products can be used right from birth and are free of perfume and essential oils: the Baby Oil Sweet Almond Coconut (29,90 €) cares for delicate baby skin particularly gently, the Tummy Stick made of 100% organic cocoa butter (14,90 €) is ideal for a gentle tummy massage, and the Mild Hair & Body Wash (19,90 €) cleanses hair and skin gently.",
                    ["yukies-baby-oil", "yukies-tummy-stick", "yukies-mild-hair-body-wash-150ml"],
                    False,
                    None,
                )
            return (
                "Unsere Babyprodukte können direkt ab der Geburt verwendet werden und sind frei von Parfum und ätherischen Ölen: Das Babyöl Sweet Almond Coconut (29,90 €) pflegt zarte Babyhaut besonders sanft, der Tummy Stick aus 100 % Bio-Kakaobutter (14,90 €) eignet sich für eine sanfte Bauchmassage, die deinem Baby guttut, und das Mild Hair & Body Wash (19,90 €) reinigt Haut und Haare besonders mild.",
                ["yukies-baby-oil", "yukies-tummy-stick", "yukies-mild-hair-body-wash-150ml"],
                False,
                None,
            )

        # 10. General product overview / default helpful answer
        prods = await self._detect_relevant_handles_from_text(user_message)
        if prods:
            handles = [p.handle for p in prods]
            p0 = prods[0]
            return (
                f"{p0.title} ({p0.size}, aktuell {p0.price}) wird in unserer Wiener Manufaktur frisch von Hand gefertigt ({p0.certification}). {p0.short_description} Über die Produktkarte unten gelangst du direkt zum Produkt im Shop.",
                handles,
                False,
                None,
            )

        all_prods = await shopify_client.get_all_products()
        if language == "fr":
            return (
                "Bienvenue chez YUKIES. Nous fabriquons à la main des cosmétiques naturels certifiés et minimalistes pour bébés, enfants et mamans dans notre laboratoire à Vienne : Body Butter, Huile pour bébé, Tummy Stick, Mild Hair & Body Wash, Sugar Scrub, Brosse à sec et Coffret cadeau. Comment puis-je vous conseiller aujourd'hui ?",
                [p.handle for p in all_prods[:3]],
                False,
                None,
            )
        if language == "it":
            return (
                "Benvenuta da YUKIES. Creiamo a mano nel nostro laboratorio a Vienna cosmetici naturali certificati e minimalisti per neonati, bambini e mamme: Body Butter, Olio Baby, Tummy Stick, Mild Hair & Body Wash, Sugar Scrub, Spazzola a secco e Confezione Regalo. Come posso aiutarti oggi?",
                [p.handle for p in all_prods[:3]],
                False,
                None,
            )
        if language == "en":
            return (
                "Welcome to YUKIES. We handcraft minimalist, certified natural cosmetics for babies, children, and mothers in our laboratory in Vienna—including our 100% organic Body Butter, Baby Oil, Tummy Stick, Mild Hair & Body Wash, Sugar Scrub, Dry Brush, and Mama & Baby Gift Box. How may I advise you today?",
                [p.handle for p in all_prods[:3]],
                False,
                None,
            )
        return (
            "Gerne berate ich dich zu unseren frisch in Wien handgefertigten YUKIES Naturkosmetik-Produkten für Babys, Kinder und Mamas: Body Butter Shea Coco, Babyöl, Tummy Stick, Mild Hair & Body Wash, Sugar Scrub Rose Vanilla, Trockenbürste und unsere Mama & Baby Geschenkbox. Suchst du eine Pflege für dich, für dein Baby oder ein Geschenk?",
            ["yukies-body-butter", "yukies-baby-oil", "geschenksbox"],
            False,
            None,
        )

    async def generate_turn(
        self,
        *,
        user_message: str,
        customer_name: str,
        customer_email: str,
        shopify_customer_id: str | None,
        is_logged_in: bool,
        current_language: str,
        current_address_form: str,
        conversation_history: list[dict],
    ) -> AssistantTurnResult:
        # 1. Layer 1 Pre-LLM Guardrail Analysis
        pre_check = analyze_customer_input(
            user_message,
            current_lang=current_language,
            current_address=current_address_form,
        )
        lang = pre_check.detected_language
        address_form = pre_check.address_form

        if pre_check.requires_immediate_handoff:
            handover_text = get_standard_handover_text(
                lang=lang,
                address_form=address_form,
                special_instruction=pre_check.special_instruction,
            )
            clean_text, fixes = sanitize_ai_response(handover_text)
            matched_prods = await self._detect_relevant_handles_from_text(user_message)
            return AssistantTurnResult(
                reply_text=clean_text,
                language=lang,
                address_form=address_form,
                referenced_products=matched_prods,
                handover_triggered=True,
                handover_reason=pre_check.handoff_reason,
                guardrail_notes={
                    "layer1_triggers": pre_check.matched_triggers,
                    "layer3_fixes": fixes,
                },
            )

        # 2. Prepare live Shopify catalog & optional order lookup context
        all_products = await shopify_client.get_all_products()
        catalog_lines = [
            f"- Handle: {p.handle} | {p.title} ({p.size}) | Live-Preis: {p.price}"
            + (f" (statt {p.compare_at_price})" if p.compare_at_price else "")
            + f" | Verfügbar: {'Ja' if p.available else 'Nein'} | Zertifikat: {p.certification} | URL: {p.product_url}"
            for p in all_products
        ]
        live_catalog_summary = "\n".join(catalog_lines)

        order_lookup_result: dict | None = None
        order_context = "Keine Bestellabfrage in dieser Nachricht."
        lower_msg = user_message.lower()
        order_num_match = re.search(r"#?\b(10\d{2})\b", user_message)
        if order_num_match or any(
            w in lower_msg
            for w in [
                "wo ist meine bestellung",
                "bestellstatus",
                "meine bestellung",
                "sendungsnummer",
                "where is my order",
                "order status",
                "track my order",
            ]
        ):
            extracted_order = (
                f"#{order_num_match.group(1)}" if order_num_match else None
            )
            order_lookup_result = await shopify_client.lookup_order_status(
                user_email=customer_email,
                shopify_customer_id=shopify_customer_id,
                order_number=extracted_order,
            )
            order_context = f"Ergebnis der Live-Bestellabfrage für {customer_email}: {order_lookup_result}"

        # 3. Call Google Gemini (gemini-2.5-flash) via google-genai SDK
        client = self._get_client()
        raw_reply = ""
        rec_handles: list[str] = []
        llm_handover = False
        llm_handover_reason: str | None = None
        used_engine = "gemini"

        if client is not None:
            try:
                sys_instruction = self._build_system_instruction(
                    customer_name=customer_name,
                    customer_email=customer_email,
                    is_logged_in=is_logged_in,
                    language=lang,
                    address_form=address_form,
                    live_catalog_summary=live_catalog_summary,
                    order_context=order_context,
                )
                history_lines = [
                    f"{m['sender_type'].upper()}: {m['content']}"
                    for m in conversation_history[-8:]
                ]
                prompt_content = (
                    "Bisheriger Gesprächsverlauf:\n"
                    + ("\n".join(history_lines) if history_lines else "(Neues Gespräch)")
                    + f"\n\nAktuelle Nachricht der Kundin / des Kunden ({lang.upper()}, Ansprache '{address_form}'):\n{user_message}"
                )

                response = await client.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt_content,
                    config=types.GenerateContentConfig(
                        system_instruction=sys_instruction,
                        temperature=0.2,
                        response_mime_type="application/json",
                        response_schema=GeminiStructuredDecision,
                    ),
                )
                if response and response.text:
                    parsed = GeminiStructuredDecision.model_validate_json(
                        response.text
                    )
                    raw_reply = parsed.reply_text
                    rec_handles = parsed.recommended_handles
                    llm_handover = parsed.trigger_handover
                    llm_handover_reason = parsed.handover_reason
            except Exception as exc:
                used_engine = f"kb_fallback_after_error:{type(exc).__name__}"

        if not raw_reply:
            (
                raw_reply,
                rec_handles,
                llm_handover,
                llm_handover_reason,
            ) = await self._knowledge_fallback_response(
                user_message=user_message,
                language=lang,
                address_form=address_form,
                order_lookup_result=order_lookup_result,
            )
            if used_engine == "gemini":
                used_engine = "kb_deterministic"

        # 4. Layer 3 Post-LLM Cosmetics Law & Zero-Emoji Sanitizer
        clean_reply, applied_fixes = sanitize_ai_response(raw_reply)

        # 5. Resolve ProductCardSchema objects for recommended handles
        prod_map = {p.handle: p for p in all_products}
        referenced_cards: list[ProductCardSchema] = []
        for h in rec_handles:
            if h in prod_map and prod_map[h] not in referenced_cards:
                referenced_cards.append(prod_map[h])

        return AssistantTurnResult(
            reply_text=clean_reply,
            language=lang,
            address_form=address_form,
            referenced_products=referenced_cards[:3],
            handover_triggered=llm_handover,
            handover_reason=llm_handover_reason,
            guardrail_notes={
                "engine": used_engine,
                "layer3_fixes": applied_fixes,
            },
        )


gemini_assistant = YukiesGeminiAssistant()
