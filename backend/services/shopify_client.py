from datetime import datetime, timezone
import time
import httpx

from backend.config import settings
from backend.schemas import ProductCardSchema


# Curated baseline catalog for YUKIES (yukies.at - Dawn 7.0) with verified handles, INCI, and live prices.
# Can be refreshed live from yukies.at/products.json or Shopify Storefront GraphQL API.
YUKIES_VERIFIED_PRODUCTS: dict[str, dict] = {
    "yukies-body-butter": {
        "handle": "yukies-body-butter",
        "title": "YUKIES Body Butter Shea Coco",
        "size": "180 g",
        "price": "25,90 €",
        "price_float": 25.90,
        "compare_at_price": None,
        "available": True,
        "certification": "COSMOS ORGANIC · 100 % Bio",
        "image_url": "https://yukies.at/cdn/shop/files/Body_Butter_Shea_Coco_180g.jpg",
        "product_url": "https://yukies.at/products/yukies-body-butter",
        "short_description": "100 % Bio Body Butter (Bio-Sheabutter & Bio-Kokosöl), ohne Parfum und ohne ätherische Öle. Unterstützt die natürliche Elastizität der Haut.",
        "tags": ["mama", "schwangerschaft", "stillzeit", "body butter", "sheabutter", "kokosöl", "bio", "hypoallergen"],
    },
    "yukies-baby-oil": {
        "handle": "yukies-baby-oil",
        "title": "YUKIES Babyöl Sweet Almond Coconut",
        "size": "150 ml",
        "price": "29,90 €",
        "price_float": 29.90,
        "compare_at_price": None,
        "available": True,
        "certification": "COSMOS ORGANIC · 99,80 % Bio",
        "image_url": "https://yukies.at/cdn/shop/files/Baby_Oil_Sweet_Almond_Coconut_150ml.jpg",
        "product_url": "https://yukies.at/products/yukies-baby-oil",
        "short_description": "Mildes Babyöl ab der Geburt mit Süßmandelöl, Bio-Kokosöl und Ringelblumenextrakt. Ohne Parfum und ohne ätherische Öle.",
        "tags": ["baby", "babyöl", "baby oil", "windelbereich", "massage", "mandelöl", "kokosöl", "ringelblume", "ab geburt"],
    },
    "yukies-sugarscrub": {
        "handle": "yukies-sugarscrub",
        "title": "YUKIES Sugar Scrub Rose Vanilla",
        "size": "200 g",
        "price": "24,90 €",
        "price_float": 24.90,
        "compare_at_price": None,
        "available": True,
        "certification": "COSMOS NATURAL · 93 % Bio",
        "image_url": "https://yukies.at/cdn/shop/files/Sugar_Scrub_Rose_Vanilla_200g.jpg",
        "product_url": "https://yukies.at/products/yukies-sugarscrub",
        "short_description": "Sanftes Körperpeeling für Erwachsene mit feinen Bio-Zuckerkristallen und echtem Rosenblütenpulver.",
        "tags": ["mama", "erwachsene", "peeling", "sugar scrub", "rose", "zuckerpeeling", "körperpeeling"],
    },
    "yukies-tummy-stick": {
        "handle": "yukies-tummy-stick",
        "title": "YUKIES Tummy Stick",
        "size": "20 g",
        "price": "14,90 €",
        "price_float": 14.90,
        "compare_at_price": None,
        "available": True,
        "certification": "100 % Bio-Kakaobutter · Vegan",
        "image_url": "https://yukies.at/cdn/shop/files/Tummy_Stick_20g.jpg",
        "product_url": "https://yukies.at/products/yukies-tummy-stick",
        "short_description": "Pflegebalsam in Stiftform aus 100 % Bio-Kakaobutter mit Stiel aus Pflanzenwachs – für eine sanfte Bauchmassage beim Baby ab der Geburt.",
        "tags": ["baby", "tummy stick", "bauchmassage", "kakaobutter", "ab geburt", "bauch"],
    },
    "yukies-mild-hair-body-wash-150ml": {
        "handle": "yukies-mild-hair-body-wash-150ml",
        "title": "YUKIES Mild Hair & Body Wash",
        "size": "150 ml",
        "price": "19,90 €",
        "price_float": 19.90,
        "compare_at_price": None,
        "available": True,
        "certification": "COSMOS NATURAL · Ohne Duftstoffe",
        "image_url": "https://yukies.at/cdn/shop/files/Mild_Hair_Body_Wash_150ml.jpg",
        "product_url": "https://yukies.at/products/yukies-mild-hair-body-wash-150ml",
        "short_description": "Mildes Wasch-Gel für Haare und Körper ohne Duftstoffe mit Ringelblumen-, Hafer- und Kamillenextrakt für das Baby und die ganze Familie.",
        "tags": ["baby", "familie", "waschgel", "shampoo", "hair", "body wash", "kamille", "hafer", "ab geburt"],
    },
    "burste": {
        "handle": "burste",
        "title": "YUKIES Trockenbürste",
        "size": "1 Stück",
        "price": "19,90 €",
        "price_float": 19.90,
        "compare_at_price": None,
        "available": True,
        "certification": "FSC-Buchenholz · 100 % Tampico-Fasern",
        "image_url": "https://yukies.at/cdn/shop/files/Trockenbuerste.jpg",
        "product_url": "https://yukies.at/products/burste",
        "short_description": "Körperbürste zum Trockenbürsten aus FSC-zertifiziertem Buchenholz und pflanzlichen Tampico-Borsten für die kosmetische Lymphdrainage.",
        "tags": ["mama", "bürste", "trockenbürste", "dry brush", "massage", "schwangerschaft"],
    },
    "geschenksbox": {
        "handle": "geschenksbox",
        "title": "YUKIES Geschenkbox (Mama & Baby Box)",
        "size": "Set (4 Produkte)",
        "price": "86,90 €",
        "price_float": 86.90,
        "compare_at_price": "95,60 €",
        "available": True,
        "certification": "COSMOS ORGANIC & NATURAL · Art.-Nr. Y-Box-1",
        "image_url": "https://yukies.at/cdn/shop/files/Geschenkbox_Mama_Baby.jpg",
        "product_url": "https://yukies.at/products/geschenksbox",
        "short_description": "Fertig verpackte Geschenkbox mit Yukies-Karte: Babyöl (150 ml) + Sugar Scrub (200 g) + Tummy Stick (20 g) + Body Butter (180 g).",
        "tags": ["geschenk", "geschenkbox", "set", "mama", "baby", "box", "rabatt", "angebot"],
    },
}

# Sandbox orders for safe isolated testing of authenticated vs. guest order tracking
SANDBOX_ORDERS: dict[str, dict] = {
    "#1042": {
        "order_number": "#1042",
        "shopify_customer_id": "cust_yukies_anna_101",
        "customer_email": "anna.mueller@example.at",
        "customer_name": "Anna Müller",
        "financial_status": "Bezahlt (PayPal)",
        "fulfillment_status": "Versendet (Österreichische Post)",
        "tracking_number": "AT-POST-994821042",
        "tracking_url": "https://www.post.at/sv/sendungsdetails?snr=AT-POST-994821042",
        "items": [
            "1x YUKIES Body Butter Shea Coco (180 g)",
            "1x YUKIES Tummy Stick (20 g)",
            "Beigabe: Yukies-Begrüßungskarte + 3x Duftwachs",
        ],
        "total_price": "40,80 € (zzgl. 4,90 € Versand)",
        "created_at": "2026-11-09",
        "estimated_delivery": "1–2 Werktage innerhalb Österreichs",
    },
    "#1048": {
        "order_number": "#1048",
        "shopify_customer_id": "cust_yukies_sophie_202",
        "customer_email": "sophie.hofer@example.at",
        "customer_name": "Sophie Hofer",
        "financial_status": "Bezahlt (Kreditkarte)",
        "fulfillment_status": "In Bearbeitung im Labor Wien (Versand innerhalb von 1–2 Werktagen)",
        "tracking_number": None,
        "tracking_url": None,
        "items": [
            "1x YUKIES Geschenkbox (Mama & Baby Box)",
            "Beigabe: Yukies-Begrüßungskarte + 1x Tummy Stick gratis (Bestellwert > 70 €)",
        ],
        "total_price": "86,90 € (Gratisversand ab 50 €)",
        "created_at": "2026-11-11",
        "estimated_delivery": "Versand erfolgt in 1–2 Werktagen nach Zahlungseingang",
    },
}


class YukiesShopifyClient:
    """Read-Only Shopify Connector for yukies.at with zero production mutation risk."""

    def __init__(self) -> None:
        self._products: dict[str, dict] = {
            k: dict(v) for k, v in YUKIES_VERIFIED_PRODUCTS.items()
        }
        self._last_sync: float = 0.0
        self._cache_ttl: float = 600.0  # 10 minutes

    async def sync_public_feed_if_available(self) -> None:
        """Optionally refresh live prices/images from yukies.at public JSON feed (read-only, 2.5s timeout)."""
        now = time.time()
        if now - self._last_sync < self._cache_ttl:
            return
        self._last_sync = now
        try:
            async with httpx.AsyncClient(timeout=2.5, follow_redirects=True) as client:
                resp = await client.get(f"https://{settings.STORE_DOMAIN}/products.json?limit=50")
                if resp.status_code == 200:
                    data = resp.json()
                    for sp in data.get("products", []):
                        handle = sp.get("handle")
                        if handle in self._products:
                            variants = sp.get("variants") or []
                            if variants:
                                v0 = variants[0]
                                raw_price = v0.get("price")
                                if raw_price:
                                    price_f = float(raw_price)
                                    self._products[handle]["price_float"] = price_f
                                    self._products[handle]["price"] = (
                                        f"{price_f:.2f} €".replace(".", ",")
                                    )
                                compare_at = v0.get("compare_at_price")
                                if compare_at and float(compare_at) > float(raw_price or 0):
                                    self._products[handle]["compare_at_price"] = (
                                        f"{float(compare_at):.2f} €".replace(".", ",")
                                    )
                                self._products[handle]["available"] = bool(
                                    v0.get("available", True)
                                )
                            images = sp.get("images") or []
                            if images and images[0].get("src"):
                                self._products[handle]["image_url"] = images[0]["src"]
        except Exception:
            # Safe fallback to verified curated snapshot if offline or sandboxed
            pass

    async def get_all_products(self) -> list[ProductCardSchema]:
        await self.sync_public_feed_if_available()
        return [ProductCardSchema(**p) for p in self._products.values()]

    async def get_product_by_handle(self, handle: str) -> ProductCardSchema | None:
        await self.sync_public_feed_if_available()
        item = self._products.get(handle)
        return ProductCardSchema(**item) if item else None

    async def search_products(
        self, query: str = "", max_price: float | None = None
    ) -> list[ProductCardSchema]:
        await self.sync_public_feed_if_available()
        q = query.lower().strip()
        results: list[tuple[int, dict]] = []

        for handle, prod in self._products.items():
            if max_price is not None and prod["price_float"] > max_price:
                continue
            if not q:
                results.append((1, prod))
                continue

            score = 0
            haystack = (
                f"{handle} {prod['title']} {prod['short_description']} {' '.join(prod['tags'])}"
            ).lower()
            for token in q.split():
                if token in haystack:
                    score += 3
            if score > 0:
                results.append((score, prod))

        if not results and max_price is not None:
            for prod in self._products.values():
                if prod["price_float"] <= max_price:
                    results.append((1, prod))

        results.sort(key=lambda item: item[0], reverse=True)
        return [ProductCardSchema(**p) for _, p in results]

    async def get_active_promotions_and_gifts(self) -> dict:
        """Return only official active store promotions & order gifts (08_aktionen.md)."""
        return {
            "discount_codes_active": False,
            "active_discount_codes": [],
            "free_shipping_rule": "Gratisversand ab 50 € Bestellwert für Österreich, die EU und die Schweiz.",
            "order_gifts": [
                "Jede Bestellung: Eine Karte mit Yukies-Logo und einer Begrüßung.",
                "Erste Bestellung: 3 Duftwachse à 5 g als Geschenk (Raumduft für Duftlampe/Wachswärmer, nicht auf der Haut anwenden).",
                "Ab 70 € Bestellwert: Ein Tummy Stick als Geschenk – nicht garantiert, solange der Vorrat reicht.",
            ],
            "gift_box_offer": {
                "handle": "geschenksbox",
                "title": "YUKIES Geschenkbox (Mama & Baby Box)",
                "set_price": self._products["geschenksbox"]["price"],
                "single_items_total": "95,60 €",
                "description": "Enthält Babyöl (150 ml), Sugar Scrub (200 g), Tummy Stick (20 g) und Body Butter (180 g) fertig als Geschenk verpackt.",
            },
        }

    async def lookup_order_status(
        self,
        user_email: str,
        shopify_customer_id: str | None = None,
        order_number: str | None = None,
    ) -> dict:
        """Read-only order lookup strictly verifying user ownership (email or shopify_customer_id)."""
        norm_email = user_email.strip().lower()
        norm_order = None
        if order_number:
            clean_num = order_number.strip().lstrip("#")
            norm_order = f"#{clean_num}"

        matched_orders: list[dict] = []
        for ord_key, ord_data in SANDBOX_ORDERS.items():
            email_matches = ord_data["customer_email"].lower() == norm_email
            id_matches = (
                bool(shopify_customer_id)
                and ord_data["shopify_customer_id"] == shopify_customer_id
            )
            if norm_order and ord_key != norm_order:
                continue
            if email_matches or id_matches:
                matched_orders.append(ord_data)

        if norm_order and norm_order in SANDBOX_ORDERS and not matched_orders:
            return {
                "found": False,
                "authorized": False,
                "message": "Aus Datenschutzgründen (DSGVO / DSG) kann der Bestellstatus nur angezeigt werden, wenn die E-Mail-Adresse mit der Bestellung übereinstimmt.",
            }

        if not matched_orders:
            return {
                "found": False,
                "authorized": True,
                "message": f"Unter der E-Mail-Adresse {user_email} wurde aktuell keine passende Bestellung im System gefunden.",
            }

        return {
            "found": True,
            "authorized": True,
            "orders": matched_orders,
            "checked_at": datetime.now(timezone.utc).isoformat(),
        }


shopify_client = YukiesShopifyClient()
