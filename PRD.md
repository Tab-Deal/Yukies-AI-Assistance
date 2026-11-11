# Product Requirements Document (PRD)
# AI Shopping Companion & Customer Support Assistant for YUKIES

**Product:** YUKIES AI Shopping Companion & Support Assistant  
**Version:** 1.1 (Final Contract Baseline – Verified with YUKIES KB v1.1)  
**Status:** Approved – Ready for Implementation  
**Target Store:** YUKIES (`yukies.at` · Yukies by Bacci Organics e.U., Winckelmannstraße 34/2/1, 1150 Wien, Austria)  
**Platform & Theme:** Shopify · Theme: **Dawn 7.0**  
**Assistant Role:** Read-Only Shopping Advisor & Customer Support Interface (Strictly Non-Actionable)  
**AI Runtime:** Cloud LLM (EU Data Residency / GDPR Compliant)  
**Multilingual Phasing:**  
- **Phase 1 (MVP):** German (`DE`) & English (`EN`)  
- **Phase 2:** French (`FR`)  
- **Phase 3:** Italian (`IT`)  
**Compliance Standards:**  
- EU GDPR & Austrian Data Protection Act (**DSG – Datenschutzgesetz**)  
- EU Cosmetics Regulation Claims Compliance (`knowledge_base/09_formulierungen.md`)  
**Expected Initial Volume:** Fewer than 1,000 conversations per month  
**Support Team (Human Handoff):** Silvia Ragucci & Barbara Bischof-Fünfrock (`office@bacciorganics.com` / `office@yukies.at`)

---

# 1. Executive Summary

## 1.1 Product Overview

The **YUKIES AI Shopping Companion & Customer Support Assistant** is a bespoke, multilingual conversational assistant built for **YUKIES (`yukies.at`)**, a Viennese manufacturer of minimalist, handmade natural cosmetics for babies, children, and mothers (crafted in small batches at the Bacci Organics laboratory in Vienna's 15th district).

The assistant is embedded into the **Shopify Dawn 7.0** storefront as a brand-aligned chat widget. It operates strictly as a **read-only shopping companion, product advisor, and customer support interface**.

It is **non-actionable** regarding store mutations:
- It **cannot** add, update, or remove items in the shopping cart.
- It **cannot** execute checkouts or payments.
- It **cannot** create or modify customer accounts.
- It **cannot** generate custom discounts, promise refunds, or promise replacements.

Instead, it guides customers to the right YUKIES products, checks real-time prices and availability from Shopify, adheres strictly to legally approved cosmetic formulations (`09_formulierungen.md`), answers FAQ and shipping/return questions, checks read-only order status for verified customers, and provides seamless human handoff (via both email notification and a Live Chat Agent Panel) to **Silvia Ragucci** and **Barbara Bischof-Fünfrock**.

## 1.2 Brand Voice & Strict Communication Rules

Based on `knowledge_base/00_system_prompt.md` and `03_markenstimme.md`:
- **Three Brand Pillars:** *Rein, Gesund, Sicher* (Pure, Healthy, Safe).
- **Tone:** Warm, calm, honest, and very polite.
- **No Emojis:** The assistant must **never** use emojis in any response.
- **Conciseness:** Maximum **3–5 sentences** per answer, except when providing step-by-step application instructions (e.g., Dry Brush usage).
- **Form of Address (`du` vs. `Sie`):** Mirrors the customer's chosen form of address (`du` or `Sie` in German).
- **Preferred Vocabulary:** *reizfrei, sanft zur Haut, frisch gefertigt, Frischmischung, Manufaktur-Qualität, keine Massenware*.

---

# 2. Product Catalog & Source-of-Truth Hierarchy

## 2.1 Conflict Resolution Priority (Critical Rule)

Several existing product descriptions on `yukies.at` still contain older wording that is no longer permitted under EU cosmetics regulations. Therefore, the system must enforce the following strict priority hierarchy when answering product questions:

1. **`knowledge_base/09_formulierungen.md` (Highest Priority – Legal Claims Filter):** Allowed vs. forbidden cosmetic/medical statements.
2. **`knowledge_base/00_system_prompt.md` & `knowledge_base/01_produkte/*.md`:** Curated product facts, INCI ingredients, and usage instructions approved by Silvia Ragucci (09.11.2026).
3. **Live Shopify Storefront / Admin API:** **Exclusive source of truth** for current prices, `compare_at_price`, stock availability, active sets, and order status.

## 2.2 YUKIES Core Product Catalog (Single Size per Product)

Each core product is sold in a single fixed size (no size/color variant selection required):

| # | Product Name | Size | Shopify Handle | Certification | Key Rules & Restrictions |
|---|---|---|---|---|---|
| 1 | **YUKIES Body Butter "Shea Coco"** | 180 g | `yukies-body-butter` | COSMOS ORGANIC (100% Bio) | Hypoallergenic, fragrance-free. **Forbidden:** *"prevents stretch marks"*, *"keeps skin elastic"*, *"completely safe"*. **Allowed:** *"supports natural skin elasticity"*, *"cares for skin as it stretches"*. (`[OFFEN]` how often/how much → hand over). |
| 2 | **YUKIES Babyöl "Sweet Almond Coconut"** | 150 ml | `yukies-baby-oil` | COSMOS ORGANIC (99.8% Bio) | Fragrance-free, from birth. White flakes = crystallized coconut oil (natural, quality unchanged). **Forbidden:** *"offers effective/gentle protection"*. **Allowed:** *"cares for delicate baby skin particularly gently"*. |
| 3 | **YUKIES Sugar Scrub "Rose Vanilla"** | 200 g | `yukies-sugarscrub` | COSMOS NATURAL (93% Bio) | For adults. Brown color over time is natural oxidation of real ground rose petals. **Exception:** Contains a tiny amount of natural parfum (no declarable allergens). **Never** call it *"fragrance-free"* or *"hypoallergenic"*. |
| 4 | **YUKIES Tummy Stick** | 20 g | `yukies-tummy-stick` | 100% Bio Cocoa Butter | Plant-wax handle (biodegradable, no wood/plastic). **Forbidden:** *"relieves cramps/bloating/colic"*, *"scientifically proven"*, *"deeply relaxing"*. **Allowed:** *"a gentle tummy massage that does your baby good"*, *"subtle cocoa scent"*. Broken stick → explain hand-warmth usage + ask for photo to `office@bacciorganics.com` + hand over. |
| 5 | **YUKIES Mild Hair & Body Wash** | 150 ml | `yukies-mild-hair-body-wash-150ml` | COSMOS NATURAL | Fragrance-free, for baby and family. Avoid eye contact. **Forbidden:** *"tear-free / tränenfrei"*. |
| 6 | **YUKIES Trockenbürste (Dry Brush)** | 1 pc | `burste` | FSC Beechwood + 100% Tampico | Brush toward the heart. **Forbidden:** *"supports lymphatic fluid drainage"*, *"good for digestion"*. **Allowed:** *"cosmetic lymphatic drainage"*. |
| 7 | **YUKIES Geschenkbox (Mama & Baby Box)** | Box | `geschenksbox` (`Y-Box-1`) | COSMOS ORGANIC / NATURAL | Pre-packaged gift box with Yukies card containing: Babyöl + Sugar Scrub + Tummy Stick + Body Butter. |

## 2.3 Sets, Order Gifts (Beigaben) & Promotions (`08_aktionen.md`)

- **Sets (`Y-SET-1` to `Y-SET-5` & `Y-Box-1`):** Prices and availability must always be queried live from Shopify. Sets do not have their own gift box. Sets may only be recommended once they are live in the Shopify store (`[OFFEN]` final distinct names for `Y-SET-4` and `Y-SET-5`).
- **Order Gifts (Beigaben):**
  - **Every order:** Yukies greeting card.
  - **First order:** 3× Duftwachse (Wax Melts, 5 g each) as a free gift (room fragrance for aroma lamp/warmer—never apply to skin).
  - **Orders ≥ 70 €:** 1× Tummy Stick as a free gift — *only while supplies last, never guaranteed* (must be phrased with this exact caveat).
- **Discount Codes:** Currently **none**. The assistant never invents or shares discount codes unless explicitly added to `08_aktionen.md` and active in Shopify.
- **Black Week (23.–27.11.2026):** Marked `[OFFEN]` pending Barbara's final text; must **not** be communicated until explicitly released.

---

# 3. Functional Requirements

## 3.1 Storefront Widget & User Onboarding (Shopify Dawn 7.0)

### FR-001: Brand-Aligned Chat Widget
- Embedded seamlessly into the **Shopify Dawn 7.0** theme on `yukies.at`.
- Responsive on desktop and mobile; minimalist aesthetic matching YUKIES branding.
- Localized UI strings for **Phase 1: German (`DE`) & English (`EN`)**, with architecture ready for **Phase 2: French (`FR`)** and **Phase 3: Italian (`IT`)**.

### FR-002: Smart User Identification Gate (Logged-In vs. Guest)
When the user clicks the chat icon:
1. **Logged-in Shopify Customer:**
   - The widget detects the logged-in customer via Shopify Dawn Liquid context (`customer.id`, `customer.email`, `customer.first_name`, `customer.last_name`).
   - No pre-chat form is required; the user enters the chat directly and their persistent `user_id` history is loaded.
2. **Guest Visitor (Not Logged In):**
   - A mandatory **Pre-Chat Form** is displayed before chatting:
     - **Name** (Required)
     - **Email Address** (Required)
     - **Privacy Consent Checkbox** (Required, compliant with Austrian DSG & EU GDPR)
   - Submitting the form registers/resolves the user's unique `user_id`, records the consent audit log, and opens the conversation.

### FR-003: Read-Only Product Cards
- Displays product image, title, live price (and `compare_at_price` if on sale), stock status, and a **"View Product" (`Produkt ansehen`)** link pointing directly to `https://yukies.at/products/<handle>`.
- **No "Add to Cart" button** inside the chat widget.

---

## 3.2 Conversational Intelligence & Legal Guardrails

### FR-004: Language Support & Phasing
- **Phase 1 (MVP):** Full fluency and testing in **German (`DE`)** and **English (`EN`)**.
- **Phase 2:** Activation of **French (`FR`)**.
- **Phase 3:** Activation of **Italian (`IT`)**.
- Architecture, database schema, and embeddings support all 4 languages (`DE`, `EN`, `FR`, `IT`) from Day 1.

### FR-005: Cosmetics Law & Medical Guardrails (`09_formulierungen.md`)
- Post-processing / prompt enforcement guarantees that none of the forbidden phrases in `09_formulierungen.md` are ever output by the assistant.
- **No Medical or Allergy Promises:** Never make nut-free or allergy-safety claims. When asked about allergies, output the exact **INCI** list from `01_produkte/*.md`, advise consulting a doctor or midwife (*Ärztin/Arzt oder Hebamme*), and hand over to the team.

### FR-006: Handling `[OFFEN]` Items
Any question touching an item marked `[OFFEN]` in `10_offene_punkte.md` must **never** be guessed or answered by the AI. Instead, the bot immediately triggers human handoff:
1. Body Butter frequency/quantity of application.
2. Inquiries from retail stores wanting to resell YUKIES.
3. Delivery times outside the EU.
4. Unreleased sets / ambiguous `Babyparty` set names (`Y-SET-4` / `Y-SET-5`) if not live.
5. Unreleased Black Week details prior to approval.

---

## 3.3 Shipping, Payment & Returns Logic (`02_faq.md` & `05_versand_logistik.md`)

### FR-007: Verified Logistics & Payment Rules
- **Payment Methods:** PayPal, Credit Card (Visa, Mastercard), Klarna (Sofortzahlung), and Prepayment by bank transfer (*Vorauszahlung per Überweisung*). All orders ship after payment receipt. **No invoice payment (*Kauf auf Rechnung*) and no American Express.**
- **Carrier & Dispatch:** Österreichische Post; ships within **1–2 business days** after payment receipt if in stock.
- **Shipping Costs & Delivery Times:**
  - **Austria:** 1–2 business days · **4,90 €**
  - **EU:** 2–4 business days · **10,90 €**
  - **Switzerland:** 5–10 business days · **16,90 €** (customs/import duties paid by buyer)
  - **Non-EU Worldwide:** up to 1 kg: **19,21 €** · up to 2 kg: **21,72 €** · up to 4 kg: **25,50 €** (delivery time `[OFFEN]` → hand over)
  - **Free Shipping Threshold:** **Free shipping from 50 € order value** for Austria, EU, and Switzerland.
- **Returns & Cancellation:**
  - 14-day right of withdrawal (*Widerrufsrecht*) via *"Vertrag widerrufen"* in the website footer.
  - **Hygiene Exception:** Sealed products whose seal, protective film, or closure has been opened after delivery cannot be returned. Only unopened, originally sealed products are accepted. Customer pays return shipping.
  - **Damaged/Defective Items (e.g., broken Tummy Stick handle or defective pump):** Apologize empathetically, ask customer to send a photo to `office@bacciorganics.com`, never promise replacement/refund/voucher directly, and immediately trigger human handoff.

---

## 3.4 Human Handoff & Live Agent Panel (`07_service_uebergabe.md` – Option B)

### FR-008: Immediate Handoff Triggers
The assistant must immediately hand over the conversation when any of the following occur:
1. Customer complaint (*Beschwerde*).
2. Skin reaction, allergy, or intolerance (*Hautreaktion oder Unverträglichkeit*).
3. Bulk orders, B2B inquiries, corporate gifts (*Firmengeschenke*), or reseller inquiries.
4. Press or cooperation requests.
5. Damaged or defective merchandise (*beschädigte oder mangelhafte Ware*).
6. Explicit customer request to speak with a human.
7. Questions not covered in the KB or marked `[OFFEN]`.

### FR-009: Dual Handoff Execution (Email Notification + Live Chat Agent Inbox)
When a handoff is triggered:
1. **Customer Message:** The assistant responds with the approved handover message (in the customer's language, matching `du`/`Sie`):
   > *„Das gebe ich gerne an unser Team weiter. Wir melden uns innerhalb von 4 Stunden, auch am Wochenende. Du erreichst uns auch direkt unter office@bacciorganics.com.“*
2. **Email Notification:** The backend immediately dispatches a structured email notification to **`office@bacciorganics.com` / `office@yukies.at`** containing the customer's Name, Email, `user_id`, reason for escalation, AI summary, and full chat transcript.
3. **Live Chat Agent Panel (Option B):**
   - **Silvia Ragucci** and **Barbara Bischof-Fünfrock** can log into the web-based **Agent Inbox / Live Chat Panel** (service hours: daily 8:00–18:00, including Sundays and holidays).
   - They can view active/escalated conversations, click **"Take Over Conversation"** (pausing AI responses), and send live messages directly into the customer's chat widget in real time (or reply via email if the customer has left the site).

---

# 4. Data Model, Austrian (DSG) & EU (GDPR) Compliance

## 4.1 Core Database Schema (PostgreSQL + `pgvector`)

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | `id` (UUID PK), `shopify_customer_id` (unique, nullable), `email` (indexed), `full_name`, `preferred_language` (`de`/`en`/`fr`/`it`), `address_form` (`du`/`Sie`), `created_at`, `updated_at` | Persistent user identity across sessions |
| `consent_records` | `id`, `user_id` (FK), `consent_version`, `accepted_at`, `auth_source` (`shopify_login` \| `guest_prechat_form`), `ip_hash` | Auditable proof of DSG/GDPR consent |
| `conversations` | `id` (UUID PK), `user_id` (FK), `language`, `status` (`ai_active` \| `waiting_for_agent` \| `agent_active` \| `resolved`), `assigned_agent`, `escalation_reason`, `ai_summary`, `created_at`, `updated_at` | Session lifecycle & Live Chat handoff state |
| `messages` | `id` (UUID PK), `conversation_id` (FK), `user_id` (FK), `sender_type` (`customer` \| `ai` \| `human_agent`), `sender_name`, `content`, `referenced_handles`, `created_at` | Full message history linked to `user_id` |
| `kb_chunks` | `id`, `source_file`, `section_title`, `content`, `embedding` (`vector`), `contains_offen` (bool), `priority_level` | Indexed knowledge base (`yukies_kb`) |
| `audit_logs` | `id`, `actor`, `action`, `target_user_id`, `timestamp`, `metadata` | GDPR data export/deletion & admin audit trail |

## 4.2 Austrian DSG & EU GDPR Compliance Controls
- **Mandatory Identification with Consent:** Every chat is tied to a `user_id` with a logged `consent_record`.
- **EU Data Residency:** Hosted in EU data centers; Cloud LLM calls use zero-data-retention / EU-compliant enterprise endpoints.
- **Data Subject Rights (Art. 15 & Art. 17 GDPR / Austrian DSG):** Admin endpoint and UI button to export a user's complete chat history by `email`/`user_id` (JSON/CSV) or permanently erase/anonymize their personal records upon request.

---

# 5. Technical Architecture & Read-Only Tools

## 5.1 System Components
1. **Storefront Chat Widget (Shopify Dawn 7.0 Snippet / App Embed):**
   - Detects `window.YukiesCustomer` from Liquid if logged in; otherwise shows the Pre-Chat Form.
   - Supports real-time polling/WebSocket updates for Live Agent takeover.
2. **Backend Service (Python FastAPI):**
   - REST + WebSocket API for widget communication, Live Chat Agent Inbox, Shopify Read-Only GraphQL client, RAG pipeline, and Cosmetics Law guardrail enforcement.
3. **Admin & Live Agent Panel (Web UI for Silvia & Barbara):**
   - View all conversations by `user_id` / email, filter by `Waiting for Agent`, take over chats live, and manage GDPR export/delete requests.
4. **PostgreSQL + `pgvector`:**
   - Stores users, consents, conversations, messages, and curated `knowledge_base/` embeddings.

## 5.2 AI Read-Only Tools (Function Calling)
1. `get_live_products_and_prices(handles: list[str])`: Fetches live prices, `compare_at_price`, stock availability, and URLs from `yukies.at` (Shopify Storefront API).
2. `search_yukies_knowledge_base(query: str)`: Retrieves curated product details, INCI lists, usage guides, shipping rules, and checks for `[OFFEN]` flags.
3. `get_customer_order_status(order_name: str)`: Verifies customer email/ID against Shopify Read-Only Order API and returns fulfillment status and tracking info.
4. `handover_to_yukies_team(reason: str, summary: str)`: Marks conversation as `waiting_for_agent`, sends email notification to `office@bacciorganics.com`, and alerts Silvia & Barbara in the Live Agent Panel.

---

# 6. Final Acceptance Criteria Checklist

- [ ] **Knowledge Base Integrity:** All 19 curated files in `knowledge_base/` are indexed; priority rule (`09_formulierungen.md` > `00_system_prompt.md` > KB > live shop text) is strictly enforced.
- [ ] **Cosmetics Law Guardrails:** Zero usage of forbidden claims (e.g., no colic/stretch-mark/neurodermatitis/tear-free claims) and **zero emojis** in any bot output.
- [ ] **Onboarding Gate:** Logged-in Shopify customers enter directly; guest users must submit Name, Email, and DSG/GDPR consent before chatting.
- [ ] **Persistent User ID Storage:** All conversations and messages are saved under `user_id` with GDPR export/delete capabilities.
- [ ] **Read-Only Non-Actionable Behavior:** Bot never modifies cart, never creates checkouts, never creates accounts, and never invents discounts or promises refunds/replacements.
- [ ] **Live Shopify Sync:** Product prices, stock status, and order statuses are always fetched live from Shopify.
- [ ] **`[OFFEN]` & Trigger Handovers:** Any `[OFFEN]` topic, complaint, skin reaction, damaged item, or B2B inquiry immediately triggers handover to Silvia & Barbara.
- [ ] **Option B Handoff:** Escalation sends both an email to `office@bacciorganics.com` and surfaces the conversation in the Live Chat Agent Panel for real-time human takeover.
- [ ] **Multilingual Phasing:** Phase 1 operates seamlessly in **German (`DE`)** and **English (`EN`)**, with architecture supporting **French (`FR`)** and **Italian (`IT`)**.
