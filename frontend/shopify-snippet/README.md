# YUKIES Shopify Dawn 7.0 Integration Guide

Dieses Verzeichnis enthält die einsatzbereiten Dateien zur nahtlosen Einbindung des **YUKIES KI-Shopping-Assistenten** in das Shopify-Theme **Dawn 7.0** auf `yukies.at`.

---

## 1. Dateien
- **`yukies-widget.js`** (`frontend/widget/`): Das vollständig gekapselte Web Component Bundle (Shadow DOM).
- **`yukies-chat-assistant.liquid`**: Das Shopify Liquid Snippet.

---

## 2. Installationsschritte in Shopify Dawn 7.0

### Schritt 1: JavaScript-Asset hochladen
1. Im Shopify Admin zu **Online Store &rarr; Themes** navigieren.
2. Beim aktiven Dawn-Theme auf **... &rarr; Edit code** klicken.
3. Im linken Menü unter **Assets** auf **Add a new asset** klicken und die Datei `yukies-widget.js` hochladen.

### Schritt 2: Liquid Snippet anlegen
1. Im linken Menü unter **Snippets** auf **Add a new snippet** klicken.
2. Namen vergeben: `yukies-chat-assistant` (ergibt `yukies-chat-assistant.liquid`).
3. Den Inhalt aus [yukies-chat-assistant.liquid](file:///Users/mr.naeimi/Documents/AI%20Assisstance%20Chat%20bot/frontend/shopify-snippet/yukies-chat-assistant.liquid) einfügen und speichern.
4. *(Optional)* Den Parameter `api-base="https://api.yukies.at"` auf die finale Produktions-URL eures Backends anpassen.

### Schritt 3: In `theme.liquid` einbinden
1. Unter **Layout** die Datei `theme.liquid` öffnen.
2. Ganz nach unten scrollen und direkt vor dem schließenden `</body>`-Tag folgende Zeile einfügen:
   ```liquid
   {% render 'yukies-chat-assistant' %}
   ```
3. Auf **Save** klicken. Fertig!

---

## 3. Funktionsweise
- **Eingeloggte Shopify-Kundinnen:** Werden automatisch über `{{ customer.id }}` und `{{ customer.email }}` erkannt. Der Chat ist sofort aktiv, ohne dass ein Formular ausgefüllt werden muss.
- **Gäste:** Werden durch das DSGVO-konforme Vor-Chat-Formular geschützt (Name, E-Mail und 180-Tage-Zustimmung).
- **Seitenwechsel (Session Persistence):** Der Chatverlauf und der Status des Fensters bleiben beim Wechseln zwischen verschiedenen Seiten im Shop (`localStorage`) nahtlos erhalten.
- **Mehrsprachigkeit:** Erkennt automatisch die Sprache des Shops (`de`, `en`, `fr`, `it`) und bietet zusätzlich im Chat-Header einen Umschalter.
- **Zero CSS Conflicts:** Dank modernem Shadow DOM greift kein Theme-CSS von Dawn 7.0 in den Chatbot ein und umgekehrt.
