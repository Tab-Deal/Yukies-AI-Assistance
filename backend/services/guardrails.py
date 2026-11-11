from dataclasses import dataclass, field
import re

# Comprehensive Unicode Emoji regex to enforce "Keine Emojis" (00_system_prompt.md & 03_markenstimme.md)
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F700-\U0001F77F"  # alchemical symbols
    "\U0001F780-\U0001F7FF"  # Geometric Shapes Extended
    "\U0001F800-\U0001F8FF"  # Supplemental Arrows-C
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA00-\U0001FA6F"  # Chess Symbols
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
    "\U00002702-\U000027B0"  # Dingbats
    "\U000024C2-\U0001F251"
    "\U00002600-\U000026FF"  # Misc symbols
    "\u200d"                 # zero-width joiner
    "\ufe0f"                 # variation selector
    "]+",
    flags=re.UNICODE,
)

# Forbidden cosmetic & medical claims -> Approved replacements (09_formulierungen.md)
FORBIDDEN_CLAIM_REPLACEMENTS: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(
            r"löst\s+Krämpfe\s+und\s+Blähungen(\s+effektiv)?", re.IGNORECASE
        ),
        "unterstützt eine sanfte Bauchmassage, die deinem Baby guttut",
    ),
    (
        re.compile(
            r"hilft\s+bei\s+(Drei-Monats-)?Koliken(\s+und\s+Blähungen)?",
            re.IGNORECASE,
        ),
        "eignet sich für eine sanfte Bauchmassage, die deinem Baby guttut",
    ),
    (
        re.compile(r"Drei-Monats-Koliken|Koliken", re.IGNORECASE),
        "Bauchwohlbefinden",
    ),
    (
        re.compile(r"wissenschaftlich\s+erwiesen[,:\s]*", re.IGNORECASE),
        "",
    ),
    (
        re.compile(r"tiefenentspannend(e|er|es|en)?", re.IGNORECASE),
        "wohltuend",
    ),
    (
        re.compile(r"hält\s+die\s+Haut\s+elastisch", re.IGNORECASE),
        "unterstützt die natürliche Elastizität der Haut",
    ),
    (
        re.compile(
            r"(verhindert|beugt)\s+(Dehnungsstreifen|Schwangerschaftsstreifen|Dehnungs-\s*und\s*Schwangerschaftsstreifen)(\s+vor)?",
            re.IGNORECASE,
        ),
        "pflegt die Haut, während sie sich dehnt",
    ),
    (
        re.compile(
            r"prevents?\s+stretch\s+marks?",
            re.IGNORECASE,
        ),
        "cares for the skin as it stretches",
    ),
    (
        re.compile(
            r"relieves?\s+(cramps|bloating|colic|three-month\s+colic)",
            re.IGNORECASE,
        ),
        "provides a gentle tummy massage that does your baby good",
    ),
    (
        re.compile(
            r"unterstützt\s+den\s+(natürlichen\s+)?Abfluss\s+der\s+Lymphflüssigkeit",
            re.IGNORECASE,
        ),
        "dient der kosmetischen Lymphdrainage",
    ),
    (
        re.compile(r"(und\s+)?tut\s+der\s+Verdauung\s+gut", re.IGNORECASE),
        "",
    ),
    (
        re.compile(
            r"bietet\s+(sanftesten|wirksamen|optimalen)\s+Schutz",
            re.IGNORECASE,
        ),
        "pflegt zarte Haut besonders sanft",
    ),
    (
        re.compile(
            r"\b(vollkommen\s+sicher|völlig\s+bedenkenlos|completely\s+safe)\b",
            re.IGNORECASE,
        ),
        "sanft zur Haut",
    ),
    (
        re.compile(r"\btierversuchsfrei\b", re.IGNORECASE),
        "vegan",
    ),
    (
        re.compile(r"\b(tränenfrei|tear-free|tear\s+free)\b", re.IGNORECASE),
        "mild und ohne Duftstoffe",
    ),
    (
        re.compile(r"\bNeurodermitis\b", re.IGNORECASE),
        "Hauterkrankungen (bitte Ärztin oder Arzt konsultieren)",
    ),
]


@dataclass
class InputGuardrailResult:
    detected_language: str = "de"
    address_form: str = "du"
    requires_immediate_handoff: bool = False
    handoff_reason: str | None = None
    special_instruction: str | None = None
    matched_triggers: list[str] = field(default_factory=list)


def detect_address_form(text: str, current_default: str = "du") -> str:
    """Detect whether the customer writes with 'Sie' (formal) or 'du' (informal)."""
    # Look for case-sensitive formal German pronouns "Sie", "Ihnen", "Ihr", "Ihre" not at sentence start
    tokens = re.findall(r"\b[A-Za-zÄÖÜäöüß]+\b", text)
    for idx, tok in enumerate(tokens):
        if tok in {"Ihnen", "Ihrem", "Ihren", "Ihrer", "Ihres"}:
            return "Sie"
        if tok in {"Sie", "Ihr", "Ihre"} and idx > 0:
            return "Sie"
        if tok.lower() in {"du", "dein", "deine", "deinem", "deinen", "dir", "dich"}:
            return "du"
    return current_default


def detect_language(text: str, fallback: str = "de") -> str:
    """Detect DE, EN, FR, or IT from user input."""
    lower = f" {text.lower()} "
    it_markers = [" ciao ", " vorrei ", " spedizione ", " bambino ", " prodotti ", " grazie ", " quanto ", " ordine "]
    fr_markers = [" bonjour ", " salut ", " livraison ", " produit ", " bébé ", " grossesse ", " commande ", " merci ", " quel ", " quelle "]
    en_markers = [" hello ", " hi ", " shipping ", " product ", " baby ", " pregnancy ", " order ", " how ", " what ", " can i ", " price ", " ingredients "]
    de_markers = [" hallo ", " versand ", " bestellung ", " schwangerschaft ", " babyöl ", " wie ", " wann ", " ich ", " für ", " ist ", " sind "]

    scores = {
        "it": sum(1 for m in it_markers if m in lower),
        "fr": sum(1 for m in fr_markers if m in lower),
        "en": sum(1 for m in en_markers if m in lower),
        "de": sum(1 for m in de_markers if m in lower),
    }
    best_lang, best_score = max(scores.items(), key=lambda item: item[1])
    if best_score == 0:
        return fallback
    return best_lang


def analyze_customer_input(
    text: str, current_lang: str = "de", current_address: str = "du"
) -> InputGuardrailResult:
    """Layer 1 Pre-LLM Guardrail: check [OFFEN] items and immediate handover triggers."""
    lang = detect_language(text, fallback=current_lang)
    address_form = detect_address_form(text, current_default=current_address)
    lower = text.lower()

    result = InputGuardrailResult(
        detected_language=lang,
        address_form=address_form,
    )

    # 1. Special case: Broken Tummy Stick handle (04_tummy_stick.md & 04_kundengespraeche.md)
    if ("tummy" in lower or "stick" in lower or "stiel" in lower) and any(
        w in lower for w in ["abgebrochen", "kaputt", "gebrochen", "broken", "snapped"]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "Beschädigte Ware: Tummy Stick Stiel abgebrochen"
        result.special_instruction = "tummy_stick_broken"
        result.matched_triggers.append("tummy_stick_broken")
        return result

    # 2. [OFFEN] Item 1: Body Butter how often / how much (10_offene_punkte.md)
    if ("body butter" in lower or "bodybutter" in lower) and any(
        w in lower
        for w in [
            "wie oft",
            "wie viel",
            "wieviel",
            "häufig",
            "menge",
            "how often",
            "how much",
            "combien de fois",
            "quante volte",
        ]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "[OFFEN] Body Butter: wie oft / wie viel anwenden"
        result.matched_triggers.append("offen_body_butter_frequency")
        return result

    # 3. [OFFEN] Item 5: Black Week / Black Friday details (08_aktionen.md & 10_offene_punkte.md)
    if any(w in lower for w in ["black week", "black friday", "cyber monday"]):
        result.requires_immediate_handoff = True
        result.handoff_reason = "[OFFEN] Black Week Aktion (noch nicht freigegeben)"
        result.matched_triggers.append("offen_black_week")
        return result

    # 4. [OFFEN] Item 3: Delivery time outside the EU (05_versand_logistik.md)
    if any(
        w in lower
        for w in ["lieferzeit", "dauert der versand", "delivery time", "how long does shipping"]
    ) and any(
        c in lower
        for c in [
            "außerhalb der eu",
            "usa",
            "uk",
            "england",
            "kanada",
            "australien",
            "weltweit",
            "drittland",
            "outside the eu",
            "outside eu",
            "united states",
        ]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "[OFFEN] Lieferzeit außerhalb der EU"
        result.matched_triggers.append("offen_non_eu_delivery_time")
        return result

    # 5. Medical / Skin reaction / Allergy / Neurodermatitis (00_system_prompt.md & 09_formulierungen.md)
    if any(
        w in lower
        for w in [
            "hautreaktion",
            "ausschlag",
            "allergische reaktion",
            "unverträglichkeit",
            "neurodermitis",
            "ekzem",
            "juckreiz",
            "brennt auf der haut",
            "skin reaction",
            "allergic reaction",
            "rash",
            "eczema",
            "atopic dermatitis",
        ]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "Hautreaktion / Unverträglichkeit / Gesundheitliche Frage"
        result.special_instruction = "medical_skin_reaction"
        result.matched_triggers.append("medical_skin_reaction")
        return result

    # 6. B2B, Reseller, Corporate Gifts, Press, Cooperation (06_b2b.md & 07_service_uebergabe.md)
    if any(
        w in lower
        for w in [
            "wiederverkauf",
            "großhandel",
            "händleranfrage",
            "in unserem geschäft verkaufen",
            "in meinem laden verkaufen",
            "firmengeschenk",
            "mitarbeitergeschenk",
            "firmenlogo",
            "großbestellung",
            "b2b",
            "presse",
            "kooperation",
            "influencer",
            "wholesale",
            "reseller",
            "corporate gift",
            "bulk order",
        ]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "B2B / Firmengeschenke / Händler- oder Kooperationsanfrage"
        result.matched_triggers.append("b2b_or_cooperation")
        return result

    # 7. Damaged / defective merchandise or complaints (05_versand_logistik.md & 07_service_uebergabe.md)
    if any(
        w in lower
        for w in [
            "beschädigt",
            "defekt",
            "pumpe kaputt",
            "ausgelaufen",
            "beschwerde",
            "reklamation",
            "mangelhaft",
            "damaged",
            "defective",
            "broken pump",
            "leaked",
            "complaint",
        ]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "Beschwerde oder beschädigte / mangelhafte Ware"
        result.special_instruction = "damaged_or_complaint"
        result.matched_triggers.append("damaged_or_complaint")
        return result

    # 8. Explicit request for a human agent
    if any(
        w in lower
        for w in [
            "mit einem menschen",
            "mit einer person",
            "echter mensch",
            "mitarbeiter sprechen",
            "silvia sprechen",
            "barbara sprechen",
            "human agent",
            "speak to a person",
            "talk to a human",
            "real person",
            "parler à un humain",
            "parlare con una persona",
        ]
    ):
        result.requires_immediate_handoff = True
        result.handoff_reason = "Kundin wünscht Gespräch mit einem Menschen"
        result.matched_triggers.append("explicit_human_request")
        return result

    return result


def get_standard_handover_text(
    lang: str = "de",
    address_form: str = "du",
    special_instruction: str | None = None,
) -> str:
    """Return the exact approved handover wording from 07_service_uebergabe.md & 04_kundengespraeche.md."""
    if special_instruction == "tummy_stick_broken":
        if lang == "en":
            return (
                "We are very sorry about that. The balm itself is undamaged: you can hold the top piece directly in your hand like a solid body butter, and it will melt gently with the warmth of your hand. "
                "Please send a photo to office@bacciorganics.com and I will pass your message directly to our team. We will get back to you within 4 hours, including on weekends."
            )
        if address_form == "Sie":
            return (
                "Das tut uns sehr leid. Der Balsam selbst ist unbeschädigt: Sie können das Kopfteil einfach wie ein Stück feste Body Butter in die Hand nehmen; durch die Wärme schmilzt er sanft. "
                "Bitte schicken Sie uns ein Foto an office@bacciorganics.com. Ich gebe Ihr Anliegen direkt an unser Team weiter – wir melden uns innerhalb von 4 Stunden, auch am Wochenende."
            )
        return (
            "Das tut uns leid! Der Balsam selbst ist unbeschädigt: Du kannst das Kopfteil einfach wie ein Stück feste Body Butter in die Hand nehmen; durch die Wärme schmilzt er sanft. "
            "Bitte schick uns ein Foto an office@bacciorganics.com. Das gebe ich gerne an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende."
        )

    if special_instruction == "medical_skin_reaction":
        if lang == "en":
            return (
                "I am sorry to hear that. For skin reactions, allergies, or medical questions, please consult a doctor or midwife. "
                "I am passing your message on to our team right away. We will get back to you within 4 hours, including on weekends, or you can reach us directly at office@bacciorganics.com."
            )
        if address_form == "Sie":
            return (
                "Das tut mir sehr leid zu hören. Bei Hautreaktionen, Allergien oder gesundheitlichen Fragen empfehlen wir, eine Ärztin, einen Arzt oder Ihre Hebamme zu Rate zu ziehen. "
                "Ich gebe Ihr Anliegen sofort an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende. Sie erreichen uns auch direkt unter office@bacciorganics.com."
            )
        return (
            "Das tut mir sehr leid zu hören. Bei Hautreaktionen, Allergien oder gesundheitlichen Fragen empfehlen wir, eine Ärztin, einen Arzt oder deine Hebamme zu Rate zu ziehen. "
            "Das gebe ich gerne an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende. Du erreichst uns auch direkt unter office@bacciorganics.com."
        )

    if special_instruction == "damaged_or_complaint":
        if lang == "en":
            return (
                "I completely understand your frustration and I am very sorry about this. If an item arrived damaged, please send a photo to office@bacciorganics.com. "
                "I am forwarding your request to our team right now. We will get back to you within 4 hours, including on weekends."
            )
        if address_form == "Sie":
            return (
                "Das tut mir sehr leid, das soll natürlich nicht so sein. Falls Ware beschädigt angekommen ist, senden Sie uns bitte ein Foto an office@bacciorganics.com. "
                "Ich gebe Ihr Anliegen direkt an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende."
            )
        return (
            "Das tut mir sehr leid, das soll natürlich nicht so sein. Falls Ware beschädigt angekommen ist, schick uns bitte ein Foto an office@bacciorganics.com. "
            "Das gebe ich gerne an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende. Du erreichst uns auch direkt unter office@bacciorganics.com."
        )

    # Default handover text (07_service_uebergabe.md)
    if lang == "en":
        return (
            "I will gladly pass this on to our team. We will get back to you within 4 hours, including on weekends. "
            "You can also reach us directly at office@bacciorganics.com."
        )
    if lang == "fr":
        return (
            "Je transmets volontiers votre demande à notre équipe. Nous vous répondrons dans un délai de 4 heures, même le week-end. "
            "Vous pouvez également nous contacter directement à office@bacciorganics.com."
        )
    if lang == "it":
        return (
            "Trasmetto volentieri la tua richiesta al nostro team. Ti risponderemo entro 4 ore, anche nel fine settimana. "
            "Puoi contattarci anche direttamente a office@bacciorganics.com."
        )
    if address_form == "Sie":
        return (
            "Das gebe ich gerne an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende. "
            "Sie erreichen uns auch direkt unter office@bacciorganics.com."
        )
    return (
        "Das gebe ich gerne an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende. "
        "Du erreichst uns auch direkt unter office@bacciorganics.com."
    )


def sanitize_ai_response(text: str) -> tuple[str, list[str]]:
    """Layer 3 Post-LLM Guardrail: strip all emojis and replace any forbidden cosmetic claims."""
    applied_fixes: list[str] = []

    # 1. Strip all emojis
    cleaned, emoji_count = EMOJI_PATTERN.subn("", text)
    if emoji_count > 0:
        applied_fixes.append(f"removed_{emoji_count}_emojis")

    # 2. Enforce 09_formulierungen.md forbidden claims filter
    for pattern, replacement in FORBIDDEN_CLAIM_REPLACEMENTS:
        if pattern.search(cleaned):
            cleaned = pattern.sub(replacement, cleaned)
            applied_fixes.append(f"replaced_forbidden_claim:{pattern.pattern[:30]}")

    # 3. Special check: Sugar Scrub must never be called hypoallergen or parfümfrei
    if "sugar scrub" in cleaned.lower() or "zuckerpeeling" in cleaned.lower():
        if re.search(r"sugar\s+scrub[^.]*hypoallergen", cleaned, re.IGNORECASE):
            cleaned = re.sub(
                r"(sugar\s+scrub[^.]*?)hypoallergen",
                r"\1für alle Hauttypen geeignet",
                cleaned,
                flags=re.IGNORECASE,
            )
            applied_fixes.append("fixed_sugar_scrub_hypoallergen")

    # Clean up double spaces created by removals
    cleaned = re.sub(r"[ \t]{2,}", " ", cleaned).strip()
    return cleaned, applied_fixes
