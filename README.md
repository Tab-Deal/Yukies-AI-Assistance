# YUKIES AI Shopping Companion & Customer Support Assistant (`yukies.at`)

An intelligent, multilingual, strictly **Read-Only AI Shopping Companion & Support Assistant** built for **YUKIES (`yukies.at` · Yukies by Bacci Organics e.U., Vienna)** on **Shopify (Dawn 7.0)**.

---

## Key Capabilities & Strict Guardrails

1. **Read-Only Shopping Companion (Non-Actionable):**
   - Guides customers to the right YUKIES products, compares options, and displays read-only Product Cards with live prices and direct links to `yukies.at`.
   - **Never** mutates the cart, creates checkouts, creates customer accounts, or invents discount codes.
2. **EU Cosmetics Regulation Claims Filter (`knowledge_base/09_formulierungen.md`):**
   - Priority hierarchy: `09_formulierungen.md` > `00_system_prompt.md` > `knowledge_base/` > live shop descriptions.
   - Deterministic post-filter guarantees **zero emojis** and replaces any prohibited medical/cosmetic claims.
3. **Smart Shopify Onboarding Gate & Austrian DSG / EU GDPR Compliance:**
   - **Logged-in Shopify Customers:** Automatically recognized via Dawn 7.0 Liquid (`window.YukiesCustomer`), entering chat directly.
   - **Guest Visitors:** Mandatory Pre-Chat Form (**Name + Email + Austrian DSG / EU GDPR Consent**) before starting a conversation.
   - All chats are stored under a persistent `user_id` with full **Art. 15 GDPR Data Export (JSON)** and **Art. 17 GDPR Right to Erasure** endpoints.
4. **Dual Human Handoff (Option B – Silvia Ragucci & Barbara Bischof-Fünfrock):**
   - Immediate escalation on `[OFFEN]` items, complaints, skin reactions/allergies, damaged goods (e.g., broken Tummy Stick handle), or B2B inquiries.
   - Sends structured email notifications to `office@bacciorganics.com` / `office@yukies.at` **AND** allows live takeover in the **Live Chat Agent Console (`/admin`)**.
5. **Multilingual Phasing:**
   - **Phase 1 (MVP):** German (`DE`) & English (`EN`)
   - **Phase 2:** French (`FR`)
   - **Phase 3:** Italian (`IT`)

---

## Quick Start (Isolated Local Sandbox)

```bash
# 1. Create virtual environment & install dependencies
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

# 2. Configure environment variables
cp .env.example .env
# Add your GEMINI_API_KEY in .env

# 3. Run automated test suite
.venv/bin/pytest -v

# 4. Start the server
.venv/bin/uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

- **Storefront Simulator + AI Chat Widget (Customer View):** `http://127.0.0.1:8000`
- **Live Chat & DSGVO Admin Console (Silvia & Barbara View):** `http://127.0.0.1:8000/admin`
