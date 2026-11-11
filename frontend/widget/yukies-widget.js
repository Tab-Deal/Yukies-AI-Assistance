/**
 * YUKIES AI Shopping Companion & Support Widget
 * Built with Web Components (Shadow DOM) for zero CSS conflict on Shopify Dawn 7.0 (yukies.at).
 * Supports both floating mode (production storefront) and inline docked mode (sandbox testing).
 */

const UI_STRINGS = {
  de: {
    brandSubtitle: "Naturkosmetik Manufaktur Wien",
    statusAi: "KI-Beratung aktiv (Gemini)",
    statusWaiting: "An unser Team übergeben (Antwort innerhalb von 4 Std.)",
    statusAgent: "Verbunden mit",
    prechatTitle: "Willkommen bei YUKIES",
    prechatIntro:
      "Bitte gib deinen Namen und deine E-Mail-Adresse ein, damit wir dich persönlich beraten und bei Bedarf unser Team hinzuziehen können.",
    nameLabel: "Vor- und Nachname *",
    namePlaceholder: "z. B. Maria Berger",
    emailLabel: "E-Mail-Adresse *",
    emailPlaceholder: "maria@beispiel.at",
    consentLabel:
      "Ich stimme zu, dass mein Name, meine E-Mail-Adresse und der Chatverlauf unter einer eindeutigen Kennung gemäß der Datenschutzerklärung (DSGVO & österreichisches DSG) für 6 Monate (180 Tage) gespeichert werden. *",
    startBtn: "Beratung starten",
    inputPlaceholder: "Deine Frage zu YUKIES Produkten, Anwendung oder Bestellung...",
    sendBtn: "Senden",
    viewProductBtn: "Produkt im Shop ansehen",
    inStock: "Vorrätig",
    outOfStock: "Aktuell ausverkauft",
    loggedInBadge: "Kundin:",
    quickPrompts: [
      "Welche Pflege empfiehlst du für die Schwangerschaft?",
      "Warum ist mein Sugar Scrub braun geworden?",
      "Welche Produkte eignen sich ab der Geburt?",
      "Wie hoch sind die Versandkosten?",
    ],
  },
  en: {
    brandSubtitle: "Natural Cosmetics Manufactory Vienna",
    statusAi: "AI Shopping Advisor active (Gemini)",
    statusWaiting: "Forwarded to our team (Reply within 4 hours)",
    statusAgent: "Connected with",
    prechatTitle: "Welcome to YUKIES",
    prechatIntro:
      "Please enter your name and email address so we can advise you personally and connect you with our team if needed.",
    nameLabel: "Full Name *",
    namePlaceholder: "e.g. Emma Miller",
    emailLabel: "Email Address *",
    emailPlaceholder: "emma@example.com",
    consentLabel:
      "I agree that my name, email address, and chat history are stored under a unique ID in accordance with the Privacy Policy (EU GDPR & Austrian DSG) for 6 months (180 days). *",
    startBtn: "Start Consultation",
    inputPlaceholder: "Ask about YUKIES products, application, or your order...",
    sendBtn: "Send",
    viewProductBtn: "View Product in Shop",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    loggedInBadge: "Customer:",
    quickPrompts: [
      "What do you recommend during pregnancy?",
      "Why did my Sugar Scrub turn brown?",
      "Which baby products can be used from birth?",
      "What are the shipping costs and free shipping rules?",
    ],
  },
  fr: {
    brandSubtitle: "Manufacture de Cosmétiques Naturels Vienne",
    statusAi: "Conseiller IA actif",
    statusWaiting: "Transmis à notre équipe (Réponse sous 4h)",
    statusAgent: "En ligne avec",
    prechatTitle: "Bienvenue chez YUKIES",
    prechatIntro:
      "Veuillez indiquer votre nom et votre adresse e-mail pour commencer la consultation.",
    nameLabel: "Nom complet *",
    namePlaceholder: "ex. Claire Martin",
    emailLabel: "Adresse e-mail *",
    emailPlaceholder: "claire@exemple.fr",
    consentLabel:
      "J'accepte que mon nom, mon e-mail et l'historique du chat soient enregistrés conformément au RGPD et à la loi autrichienne DSG. *",
    startBtn: "Démarrer",
    inputPlaceholder: "Votre question sur nos produits ou votre commande...",
    sendBtn: "Envoyer",
    viewProductBtn: "Voir le produit",
    inStock: "En stock",
    outOfStock: "Épuisé",
    loggedInBadge: "Cliente :",
    quickPrompts: [
      "Quels produits pour la grossesse ?",
      "Quels soins pour bébé dès la naissance ?",
    ],
  },
  it: {
    brandSubtitle: "Manifattura Cosmetica Naturale Vienna",
    statusAi: "Assistente IA attivo",
    statusWaiting: "Inoltrato al nostro team (Risposta entro 4 ore)",
    statusAgent: "In chat con",
    prechatTitle: "Benvenuta da YUKIES",
    prechatIntro:
      "Inserisci il tuo nome e indirizzo e-mail per iniziare la consulenza.",
    nameLabel: "Nome e Cognome *",
    namePlaceholder: "es. Giulia Rossi",
    emailLabel: "Indirizzo E-mail *",
    emailPlaceholder: "giulia@esempio.it",
    consentLabel:
      "Acconsento alla memorizzazione di nome, e-mail e cronologia chat secondo il GDPR e la legge austriaca DSG. *",
    startBtn: "Inizia la chat",
    inputPlaceholder: "Fai una domanda sui prodotti YUKIES o sul tuo ordine...",
    sendBtn: "Invia",
    viewProductBtn: "Vedi prodotto nello shop",
    inStock: "Disponibile",
    outOfStock: "Esaurito",
    loggedInBadge: "Cliente:",
    quickPrompts: [
      "Quali prodotti consigliate in gravidanza?",
      "Quali prodotti per neonati dalla nascita?",
    ],
  },
};

class YukiesChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.apiBase = this.getAttribute("api-base") || window.location.origin;
    this.isInline = this.getAttribute("mode") === "inline";
    this.isOpen = this.isInline || this.getAttribute("default-open") === "true";
    this.lang = (window.YukiesCustomer && window.YukiesCustomer.locale) || "de";
    if (!UI_STRINGS[this.lang]) this.lang = "de";

    this.session = null;
    this.ws = null;
    this.isSending = false;
  }

  connectedCallback() {
    this.isInline = this.getAttribute("mode") === "inline";
    this.isOpen = this.isInline || this.getAttribute("default-open") === "true";
    this.loadStoredGuestSession();
    this.render();
    this.bindEvents();
    if (this.isOpen) {
      this.ensureSessionIfLoggedIn().then(() => {
        this.render();
        this.bindEvents();
        this.scrollToBottom();
      });
    }
    window.addEventListener("yukies-customer-changed", () => {
      this.handleCustomerIdentityChange();
    });
  }

  loadStoredGuestSession() {
    const cust = window.YukiesCustomer;
    if (cust && cust.id) {
      return;
    }
    try {
      const saved = localStorage.getItem("yukies_guest_session_v1");
      this.savedGuest = saved ? JSON.parse(saved) : null;
    } catch (_) {
      this.savedGuest = null;
    }
  }

  async handleCustomerIdentityChange() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.session = null;
    this.loadStoredGuestSession();
    if (this.isOpen) {
      await this.ensureSessionIfLoggedIn();
    }
    this.render();
    this.bindEvents();
    this.scrollToBottom();
  }

  async toggleOpen() {
    if (this.isInline) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen && !this.session) {
      await this.ensureSessionIfLoggedIn();
    }
    this.render();
    this.bindEvents();
    this.scrollToBottom();
  }

  async ensureSessionIfLoggedIn() {
    const cust = window.YukiesCustomer;
    if (cust && cust.id && cust.email) {
      await this.initBackendSession({
        shopify_customer_id: String(cust.id),
        full_name: cust.full_name || "Kundin",
        email: cust.email,
        gdpr_consent: true,
        language: this.lang,
      });
    } else if (
      this.savedGuest &&
      this.savedGuest.email &&
      this.savedGuest.full_name
    ) {
      await this.initBackendSession({
        shopify_customer_id: null,
        full_name: this.savedGuest.full_name,
        email: this.savedGuest.email,
        gdpr_consent: true,
        language: this.lang,
        conversation_id: this.savedGuest.conversation_id || null,
      });
    }
  }

  async initBackendSession(payload) {
    try {
      const res = await fetch(`${this.apiBase}/api/chat/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return;
      this.session = await res.json();
      if (!payload.shopify_customer_id) {
        localStorage.setItem(
          "yukies_guest_session_v1",
          JSON.stringify({
            user_id: this.session.user_id,
            conversation_id: this.session.conversation_id,
            full_name: this.session.full_name,
            email: this.session.email,
          })
        );
      }
      this.connectWebSocket(this.session.conversation_id);
    } catch (err) {
      console.error("YUKIES session init error:", err);
    }
  }

  connectWebSocket(conversationId) {
    if (this.ws) {
      this.ws.close();
    }
    const wsProto = this.apiBase.startsWith("https") ? "wss" : "ws";
    const hostPart = this.apiBase.replace(/^https?:\/\//, "");
    this.ws = new WebSocket(
      `${wsProto}://${hostPart}/ws/chat/${conversationId}`
    );
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!this.session) return;
        if (data.status) {
          this.session.status = data.status;
        }
        if ("assigned_agent" in data) {
          this.session.assigned_agent = data.assigned_agent;
        }
        if (
          data.message &&
          (data.event === "human_agent_message" ||
            data.event === "agent_takeover")
        ) {
          const exists = this.session.messages.some(
            (m) => m.id === data.message.id
          );
          if (!exists) {
            this.session.messages.push(data.message);
          }
        }
        this.render();
        this.bindEvents();
        this.scrollToBottom();
      } catch (e) {
        console.error("WebSocket parse error:", e);
      }
    };
  }

  async sendMessage(text) {
    if (!text || !text.trim() || !this.session || this.isSending) return;
    const cleanText = text.trim();
    this.isSending = true;

    this.session.messages.push({
      id: "temp-" + Date.now(),
      sender_type: "customer",
      sender_name: this.session.full_name,
      content: cleanText,
      referenced_products: [],
      created_at: new Date().toISOString(),
    });
    this.render();
    this.bindEvents();
    this.scrollToBottom();

    try {
      const res = await fetch(`${this.apiBase}/api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: this.session.user_id,
          conversation_id: this.session.conversation_id,
          message: cleanText,
          language: this.lang,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        this.session.status = data.status;
        this.session.assigned_agent = data.assigned_agent;
        this.session.messages.pop();
        this.session.messages.push(data.customer_message);
        if (data.reply_message) {
          const already = this.session.messages.some(
            (m) => m.id === data.reply_message.id
          );
          if (!already) {
            this.session.messages.push(data.reply_message);
          }
        }
      }
    } catch (err) {
      console.error("YUKIES sendMessage error:", err);
    } finally {
      this.isSending = false;
      this.render();
      this.bindEvents();
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      const body = this.shadowRoot.querySelector(".yukies-messages");
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    });
  }

  escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  renderStatusBadge(t) {
    if (!this.session) return t.brandSubtitle;
    if (this.session.status === "agent_active" && this.session.assigned_agent) {
      return `${t.statusAgent} ${this.escapeHtml(this.session.assigned_agent)}`;
    }
    if (this.session.status === "waiting_for_agent") {
      return t.statusWaiting;
    }
    return t.statusAi;
  }

  renderProductCards(cards, t) {
    if (!cards || !cards.length) return "";
    return `
      <div class="yukies-product-cards">
        ${cards
          .map(
            (p) => `
          <div class="yukies-product-card">
            <div class="yukies-product-top">
              <div>
                <div class="yukies-product-cert">${this.escapeHtml(
                  p.certification || "YUKIES Wien"
                )}</div>
                <div class="yukies-product-title">${this.escapeHtml(
                  p.title
                )}</div>
                <div class="yukies-product-size">${this.escapeHtml(
                  p.size
                )}</div>
              </div>
              <div class="yukies-product-price-box">
                ${
                  p.compare_at_price
                    ? `<span class="yukies-price-old">${this.escapeHtml(
                        p.compare_at_price
                      )}</span>`
                    : ""
                }
                <span class="yukies-price-current">${this.escapeHtml(
                  p.price
                )}</span>
                <span class="yukies-stock-pill ${
                  p.available ? "in-stock" : "out-stock"
                }">${p.available ? t.inStock : t.outOfStock}</span>
              </div>
            </div>
            <div class="yukies-product-desc">${this.escapeHtml(
              p.short_description
            )}</div>
            <a class="yukies-product-link" href="${this.escapeHtml(
              p.product_url
            )}" target="_blank" rel="noopener noreferrer">
              ${t.viewProductBtn} &rarr;
            </a>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  render() {
    const t = UI_STRINGS[this.lang] || UI_STRINGS.de;
    const isIdentified = Boolean(this.session && this.session.user_id);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --yk-bg: #FAF7F2;
          --yk-surface: #FFFFFF;
          --yk-primary: #2E3B32;
          --yk-primary-hover: #212B24;
          --yk-accent: #C7B299;
          --yk-border: #E6DFD5;
          --yk-text: #232321;
          --yk-muted: #6E6A63;
          --yk-agent-bg: #EEF4F0;
          font-family: 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: var(--yk-text);
          display: block;
        }

        .yukies-launcher {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 99999;
          display: ${this.isInline ? "none" : "flex"};
          align-items: center;
          gap: 10px;
          background: var(--yk-primary);
          color: #FAF7F2;
          border: 1px solid rgba(255,255,255,0.14);
          padding: 14px 22px;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(46, 59, 50, 0.24);
          font-size: 14px;
          font-weight: 500;
        }
        .yukies-launcher-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #98C9A3;
        }

        .yukies-window {
          ${
            this.isInline
              ? `
            position: relative;
            width: 100%;
            height: 600px;
            display: flex;
          `
              : `
            position: fixed;
            bottom: 88px;
            right: 24px;
            width: 400px;
            max-width: calc(100vw - 32px);
            height: 620px;
            max-height: calc(100vh - 120px);
            display: ${this.isOpen ? "flex" : "none"};
            z-index: 99999;
          `
          }
          background: var(--yk-bg);
          border: 1px solid var(--yk-border);
          border-radius: 18px;
          box-shadow: 0 14px 36px rgba(28, 33, 29, 0.12);
          flex-direction: column;
          overflow: hidden;
        }

        .yukies-header {
          background: var(--yk-primary);
          color: #FAF7F2;
          padding: 15px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .yukies-brand-title {
          font-size: 15.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .yukies-brand-sub {
          font-size: 11.5px;
          color: #D5DDD7;
          margin-top: 3px;
        }
        .yukies-header-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .yukies-lang-select {
          background: rgba(255,255,255,0.12);
          color: #FAF7F2;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 8px;
          padding: 4px 8px;
          font-size: 11px;
          cursor: pointer;
          outline: none;
        }
        .yukies-lang-select option {
          color: #232321;
          background: #FFFFFF;
        }
        .yukies-close-btn {
          display: ${this.isInline ? "none" : "inline-block"};
          background: transparent;
          border: none;
          color: #FAF7F2;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          padding: 4px 6px;
        }

        .yukies-user-bar {
          background: #F1ECE3;
          border-bottom: 1px solid var(--yk-border);
          padding: 8px 16px;
          font-size: 11.5px;
          color: var(--yk-muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .yukies-user-id-tag {
          font-family: monospace;
          font-size: 10.5px;
          background: rgba(46, 59, 50, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--yk-primary);
        }

        .yukies-prechat {
          padding: 22px 20px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .yukies-prechat h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--yk-primary);
        }
        .yukies-prechat p {
          margin: 0 0 16px 0;
          font-size: 13px;
          line-height: 1.5;
          color: var(--yk-muted);
        }
        .yukies-field {
          margin-bottom: 12px;
        }
        .yukies-field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--yk-text);
        }
        .yukies-field input[type="text"],
        .yukies-field input[type="email"] {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid var(--yk-border);
          border-radius: 10px;
          background: var(--yk-surface);
          font-size: 13.5px;
          outline: none;
        }
        .yukies-consent-box {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 10px 0 16px 0;
          font-size: 11.5px;
          line-height: 1.45;
          color: var(--yk-muted);
        }
        .yukies-submit-btn {
          width: 100%;
          background: var(--yk-primary);
          color: #FAF7F2;
          border: none;
          border-radius: 10px;
          padding: 12px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
        }

        .yukies-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .yukies-msg {
          max-width: 86%;
          padding: 11px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.5;
          word-wrap: break-word;
        }
        .yukies-msg.ai {
          align-self: flex-start;
          background: var(--yk-surface);
          border: 1px solid var(--yk-border);
          border-bottom-left-radius: 4px;
        }
        .yukies-msg.customer {
          align-self: flex-end;
          background: var(--yk-primary);
          color: #FAF7F2;
          border-bottom-right-radius: 4px;
        }
        .yukies-msg.human_agent {
          align-self: flex-start;
          background: var(--yk-agent-bg);
          border: 1px solid #B8D1BF;
          border-bottom-left-radius: 4px;
        }
        .yukies-msg.system {
          align-self: center;
          background: #EFECE6;
          color: var(--yk-muted);
          font-size: 11.5px;
          padding: 6px 12px;
          border-radius: 999px;
          max-width: 92%;
          text-align: center;
        }
        .yukies-sender-label {
          font-size: 10.5px;
          font-weight: 600;
          color: var(--yk-muted);
          margin-bottom: 4px;
          text-transform: uppercase;
        }

        .yukies-product-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        .yukies-product-card {
          background: #FAF7F2;
          border: 1px solid var(--yk-border);
          border-radius: 10px;
          padding: 10px 12px;
        }
        .yukies-product-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
        }
        .yukies-product-cert {
          font-size: 10px;
          text-transform: uppercase;
          color: #5C7463;
          font-weight: 600;
        }
        .yukies-product-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--yk-primary);
          margin-top: 2px;
        }
        .yukies-product-size {
          font-size: 11px;
          color: var(--yk-muted);
        }
        .yukies-product-price-box {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .yukies-price-old {
          font-size: 11px;
          text-decoration: line-through;
          color: var(--yk-muted);
        }
        .yukies-price-current {
          font-size: 13px;
          font-weight: 600;
          color: var(--yk-text);
        }
        .yukies-stock-pill {
          font-size: 9.5px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 3px;
        }
        .yukies-stock-pill.in-stock {
          background: #E4F0E7;
          color: #265332;
        }
        .yukies-stock-pill.out-stock {
          background: #F7E4E4;
          color: #7D2828;
        }
        .yukies-product-desc {
          font-size: 11.5px;
          color: var(--yk-muted);
          margin: 6px 0 8px 0;
          line-height: 1.4;
        }
        .yukies-product-link {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--yk-primary);
          text-decoration: none;
          border-bottom: 1px solid var(--yk-primary);
        }

        .yukies-quick-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .yukies-quick-btn {
          background: var(--yk-surface);
          border: 1px solid var(--yk-border);
          border-radius: 999px;
          padding: 6px 11px;
          font-size: 11.5px;
          color: var(--yk-primary);
          cursor: pointer;
        }
        .yukies-quick-btn:hover {
          background: #EFEAE1;
        }

        .yukies-footer {
          padding: 12px 14px;
          background: var(--yk-surface);
          border-top: 1px solid var(--yk-border);
          display: flex;
          gap: 8px;
        }
        .yukies-input {
          flex: 1;
          border: 1px solid var(--yk-border);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 13.5px;
          outline: none;
          background: var(--yk-bg);
        }
        .yukies-input:focus {
          border-color: var(--yk-primary);
        }
        .yukies-send-btn {
          background: var(--yk-primary);
          color: #FAF7F2;
          border: none;
          border-radius: 10px;
          padding: 0 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        }
      </style>

      <div class="yukies-window" role="dialog" aria-label="YUKIES Kundenberatung">
        <div class="yukies-header">
          <div>
            <div class="yukies-brand-title">YUKIES WIEN · KI-BERATUNG</div>
            <div class="yukies-brand-sub">${this.renderStatusBadge(t)}</div>
          </div>
          <div class="yukies-header-controls">
            <select class="yukies-lang-select" aria-label="Sprache wählen">
              <option value="de" ${this.lang === "de" ? "selected" : ""}>DE</option>
              <option value="en" ${this.lang === "en" ? "selected" : ""}>EN</option>
              <option value="fr" ${this.lang === "fr" ? "selected" : ""}>FR</option>
              <option value="it" ${this.lang === "it" ? "selected" : ""}>IT</option>
            </select>
            <button class="yukies-close-btn" title="Schließen">&times;</button>
          </div>
        </div>

        ${
          isIdentified
            ? `
          <div class="yukies-user-bar">
            <span>${t.loggedInBadge} <strong>${this.escapeHtml(
                this.session.full_name
              )}</strong> (${this.escapeHtml(this.session.email)})</span>
            <span class="yukies-user-id-tag">ID: ${this.escapeHtml(
              this.session.user_id.slice(0, 8)
            )}</span>
          </div>

          <div class="yukies-messages">
            ${this.session.messages
              .map(
                (m) => `
              <div class="yukies-msg ${this.escapeHtml(m.sender_type)}">
                ${
                  m.sender_type === "human_agent"
                    ? `<div class="yukies-sender-label">${this.escapeHtml(
                        m.sender_name
                      )} (YUKIES Team)</div>`
                    : ""
                }
                <div>${this.escapeHtml(m.content)}</div>
                ${this.renderProductCards(m.referenced_products, t)}
              </div>
            `
              )
              .join("")}

            ${
              this.session.messages.length <= 1
                ? `
              <div class="yukies-quick-list">
                ${t.quickPrompts
                  .map(
                    (qp) =>
                      `<button class="yukies-quick-btn" data-prompt="${this.escapeHtml(
                        qp
                      )}">${this.escapeHtml(qp)}</button>`
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${
              this.isSending
                ? `<div class="yukies-msg system">YUKIES KI-Assistent antwortet...</div>`
                : ""
            }
          </div>

          <form class="yukies-footer" id="yukies-chat-form">
            <input
              type="text"
              class="yukies-input"
              id="yukies-chat-input"
              placeholder="${this.escapeHtml(t.inputPlaceholder)}"
              autocomplete="off"
              ${this.isSending ? "disabled" : ""}
            />
            <button type="submit" class="yukies-send-btn" ${
              this.isSending ? "disabled" : ""
            }>${this.escapeHtml(t.sendBtn)}</button>
          </form>
        `
            : `
          <form class="yukies-prechat" id="yukies-prechat-form">
            <h3>${this.escapeHtml(t.prechatTitle)}</h3>
            <p>${this.escapeHtml(t.prechatIntro)}</p>

            <div class="yukies-field">
              <label for="yk-guest-name">${this.escapeHtml(t.nameLabel)}</label>
              <input type="text" id="yk-guest-name" required placeholder="${this.escapeHtml(
                t.namePlaceholder
              )}" />
            </div>

            <div class="yukies-field">
              <label for="yk-guest-email">${this.escapeHtml(t.emailLabel)}</label>
              <input type="email" id="yk-guest-email" required placeholder="${this.escapeHtml(
                t.emailPlaceholder
              )}" />
            </div>

            <label class="yukies-consent-box">
              <input type="checkbox" id="yk-guest-consent" required checked />
              <span>${this.escapeHtml(t.consentLabel)}</span>
            </label>

            <button type="submit" class="yukies-submit-btn">${this.escapeHtml(
              t.startBtn
            )}</button>
          </form>
        `
        }
      </div>

      <button class="yukies-launcher" id="yukies-launcher-btn">
        <span class="yukies-launcher-dot"></span>
        <span>YUKIES Beratung</span>
      </button>
    `;
  }

  bindEvents() {
    const launcher = this.shadowRoot.getElementById("yukies-launcher-btn");
    if (launcher) {
      launcher.onclick = () => this.toggleOpen();
    }

    const closeBtn = this.shadowRoot.querySelector(".yukies-close-btn");
    if (closeBtn) {
      closeBtn.onclick = () => this.toggleOpen();
    }

    const langSelect = this.shadowRoot.querySelector(".yukies-lang-select");
    if (langSelect) {
      langSelect.onchange = (e) => {
        this.lang = e.target.value;
        this.render();
        this.bindEvents();
      };
    }

    const prechatForm = this.shadowRoot.getElementById("yukies-prechat-form");
    if (prechatForm) {
      prechatForm.onsubmit = async (e) => {
        e.preventDefault();
        const nameEl = this.shadowRoot.getElementById("yk-guest-name");
        const emailEl = this.shadowRoot.getElementById("yk-guest-email");
        const consentEl = this.shadowRoot.getElementById("yk-guest-consent");
        if (
          !nameEl.value.trim() ||
          !emailEl.value.trim() ||
          !consentEl.checked
        ) {
          return;
        }
        await this.initBackendSession({
          shopify_customer_id: null,
          full_name: nameEl.value.trim(),
          email: emailEl.value.trim(),
          gdpr_consent: true,
          language: this.lang,
        });
        this.render();
        this.bindEvents();
        this.scrollToBottom();
      };
    }

    const chatForm = this.shadowRoot.getElementById("yukies-chat-form");
    if (chatForm) {
      chatForm.onsubmit = async (e) => {
        e.preventDefault();
        const input = this.shadowRoot.getElementById("yukies-chat-input");
        if (!input || !input.value.trim()) return;
        const val = input.value;
        input.value = "";
        await this.sendMessage(val);
      };
    }

    const quickBtns = this.shadowRoot.querySelectorAll(".yukies-quick-btn");
    quickBtns.forEach((btn) => {
      btn.onclick = () => {
        const prompt = btn.getAttribute("data-prompt");
        if (prompt) this.sendMessage(prompt);
      };
    });
  }
}

if (!customElements.get("yukies-chat-widget")) {
  customElements.define("yukies-chat-widget", YukiesChatWidget);
}
