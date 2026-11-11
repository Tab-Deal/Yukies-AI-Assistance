# YUKIES AI Assistant – Knowledge Base

Version: 1.1 · Date: 9 Nov 2026 · Owner: Mohammadreza Naeimi (Peaver Solutions)
Source: Silvia Ragucci's answers in the Google Form "Infos für den KI-Assistenten" (6 Nov 2026) her follow-up answers (8–9 Nov 2026) and her documents "Text für KI" and "Set-Zusammensetzung" (9 Nov 2026). All wording rules in `09_formulierungen.md` are approved by Silvia.

## Structure
The folders follow the sections of the form Silvia filled in.

- `00_system_prompt.md`: Role, languages, fixed rules (load as system prompt)
- `01_produkte/`: 1 · Produkte (general info + one file per product, same template)
- `02_faq.md`: 2 · Häufige Fragen (order & payment, usage, other)
- `03_markenstimme.md`: 3 · Markenstimme (tone, words, what never to say)
- `04_kundengespraeche.md`: 4 · Frühere Kundengespräche (typical requests, difficult conversations)
- `05_versand_logistik.md`: 5 · Versand und Logistik
- `06_b2b.md`: 6 · B2B (WhatsApp)
- `07_service_uebergabe.md`: 7 · Service und Übergabe
- `08_aktionen.md`: Promotions, gifts, sets
- `09_formulierungen.md`: Allowed / forbidden claims (cosmetics law) – highest priority
- `10_offene_punkte.md`: Open items still to be answered by Silvia

## Rules for the integration
1. **Prices, stock, cart, order status and policies come live from Shopify (Storefront MCP), never from these files.** The KB deliberately contains no prices except where noted as a dated example.
2. **Priority on conflict:** `09_formulierungen.md` > `00_system_prompt.md` > other files > live product descriptions. Several existing product texts on yukies.at still contain claims that are no longer allowed; the bot must follow `09_formulierungen.md`.
3. Lines marked **[OFFEN]** are not confirmed yet. The bot must not answer these points; it hands over to the team instead.
4. Content language is German. The bot answers in German, English or Italian (the customer's language).
5. Handover triggers and the handover text are in `07_service_uebergabe.md`.
6. Store: yukies.at (Shopify, Dawn 7.0). Handles are listed in each product file.
