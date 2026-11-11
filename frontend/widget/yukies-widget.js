/**
 * YUKIES AI Shopping Companion & Customer Support Widget
 * Production-ready Web Component (Shadow DOM) for Shopify Dawn 7.0 (yukies.at).
 * 
 * Features:
 * - 100% Shadow DOM encapsulation (zero CSS conflicts with Shopify Dawn 7.0).
 * - Full Cross-Page Session Persistence (localStorage with 180-day GDPR retention).
 * - Floating Drawer (Desktop floating card + Mobile full drawer).
 * - Multilingual support (DE, EN, FR, IT) with instant in-widget switcher.
 * - Real-Time WebSockets for Live Agent Handoff (Silvia Ragucci & Barbara Bischof-Fünfrock).
 * - Zero Emojis & EU Cosmetics Law Compliance.
 */

const YUKIES_STORAGE_KEY = "yukies_chat_state_v1";
const RETENTION_DAYS = 180;

const UI_STRINGS = {
  de: {
    brandName: "YUKIES WIEN",
    brandSubtitle: "Naturkosmetik Manufaktur",
    launcherText: "YUKIES Beratung",
    statusAi: "KI-Beraterin aktiv",
    statusWaiting: "An Silvia & Barbara übergeben (Antwort < 4 Std.)",
    statusAgent: "In Chat mit",
    prechatTitle: "Willkommen bei YUKIES",
    prechatIntro:
      "Trage bitte kurz deinen Namen und deine E-Mail-Adresse ein, damit wir dich persönlich zu unseren Naturkosmetik-Produkten beraten können.",
    nameLabel: "Vor- und Nachname *",
    namePlaceholder: "z. B. Maria Berger",
    emailLabel: "E-Mail-Adresse *",
    emailPlaceholder: "maria@beispiel.at",
    consentLabel:
      "Ich stimme zu, dass mein Name, meine E-Mail-Adresse und der Chatverlauf gemäß der Datenschutzerklärung (DSGVO & österreichisches DSG) für 6 Monate (180 Tage) gespeichert werden. *",
    startBtn: "Beratung starten",
    inputPlaceholder: "Frage zu Produkten, Inhaltsstoffen oder Bestellung...",
    sendBtn: "Senden",
    viewProductBtn: "Auf yukies.at ansehen",
    inStock: "Vorrätig",
    outOfStock: "Ausverkauft",
    loggedInBadge: "Kundin:",
    guestBadge: "Gast:",
    newChatBtn: "Neuer Chat",
    closeBtn: "Schließen",
    quickPrompts: [
      "Welche Pflege empfiehlst du für die Schwangerschaft?",
      "Warum ist mein Sugar Scrub braun geworden?",
      "Welche Produkte eignen sich ab der Geburt?",
      "Wie hoch sind die Versandkosten?",
    ],
    aiTyping: "YUKIES Beraterin tippt...",
  },
  en: {
    brandName: "YUKIES VIENNA",
    brandSubtitle: "Natural Cosmetics Manufactory",
    launcherText: "YUKIES Advisor",
    statusAi: "AI Shopping Advisor active",
    statusWaiting: "Forwarded to our team (Reply < 4 hrs)",
    statusAgent: "Connected with",
    prechatTitle: "Welcome to YUKIES",
    prechatIntro:
      "Please enter your name and email address so we can assist you personally with our handmade skincare products.",
    nameLabel: "Full Name *",
    namePlaceholder: "e.g. Emma Miller",
    emailLabel: "Email Address *",
    emailPlaceholder: "emma@example.com",
    consentLabel:
      "I agree that my name, email address, and chat history are stored in accordance with the Privacy Policy (EU GDPR & Austrian DSG) for 6 months (180 days). *",
    startBtn: "Start Consultation",
    inputPlaceholder: "Ask about products, ingredients, or orders...",
    sendBtn: "Send",
    viewProductBtn: "View on yukies.at",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    loggedInBadge: "Customer:",
    guestBadge: "Guest:",
    newChatBtn: "New Chat",
    closeBtn: "Close",
    quickPrompts: [
      "What do you recommend during pregnancy?",
      "Why did my Sugar Scrub turn brown?",
      "Which baby products can be used from birth?",
      "What are the shipping costs?",
    ],
    aiTyping: "YUKIES Advisor is typing...",
  },
  fr: {
    brandName: "YUKIES VIENNE",
    brandSubtitle: "Manufacture de Cosmétiques Naturels",
    launcherText: "Conseil YUKIES",
    statusAi: "Conseillère IA active",
    statusWaiting: "Transmis à notre équipe (Réponse < 4h)",
    statusAgent: "En chat avec",
    prechatTitle: "Bienvenue chez YUKIES",
    prechatIntro:
      "Veuillez indiquer votre nom et adresse e-mail pour commencer votre consultation personnalisée.",
    nameLabel: "Nom complet *",
    namePlaceholder: "ex. Claire Martin",
    emailLabel: "Adresse e-mail *",
    emailPlaceholder: "claire@exemple.fr",
    consentLabel:
      "J'accepte que mon nom, e-mail et historique de chat soient conservés selon le RGPD et la loi autrichienne DSG pendant 6 mois (180 jours). *",
    startBtn: "Commencer la consultation",
    inputPlaceholder: "Posez votre question sur nos produits ou votre commande...",
    sendBtn: "Envoyer",
    viewProductBtn: "Voir sur yukies.at",
    inStock: "En stock",
    outOfStock: "Épuisé",
    loggedInBadge: "Cliente :",
    guestBadge: "Invitée :",
    newChatBtn: "Nouveau chat",
    closeBtn: "Fermer",
    quickPrompts: [
      "Quels soins pour la grossesse et l'allaitement ?",
      "Quels produits pour bébé dès la naissance ?",
      "Quels sont les délais de livraison ?",
    ],
    aiTyping: "La conseillère YUKIES répond...",
  },
  it: {
    brandName: "YUKIES VIENNA",
    brandSubtitle: "Manifattura Cosmetica Naturale",
    launcherText: "Consulenza YUKIES",
    statusAi: "Assistente IA attiva",
    statusWaiting: "Inoltrato al team (Risposta < 4 ore)",
    statusAgent: "In chat con",
    prechatTitle: "Benvenuta da YUKIES",
    prechatIntro:
      "Inserisci nome ed e-mail per ricevere una consulenza personalizzata sui nostri cosmetici naturali.",
    nameLabel: "Nome e Cognome *",
    namePlaceholder: "es. Giulia Rossi",
    emailLabel: "Indirizzo E-mail *",
    emailPlaceholder: "giulia@esempio.it",
    consentLabel:
      "Acconsento alla memorizzazione di nome, e-mail e cronologia chat secondo il GDPR e la legge austriaca DSG per 6 mesi (180 giorni). *",
    startBtn: "Inizia consulenza",
    inputPlaceholder: "Fai una domanda sui prodotti o sul tuo ordine...",
    sendBtn: "Invia",
    viewProductBtn: "Vedi su yukies.at",
    inStock: "Disponibile",
    outOfStock: "Esaurito",
    loggedInBadge: "Cliente:",
    guestBadge: "Ospite:",
    newChatBtn: "Nuova chat",
    closeBtn: "Chiudi",
    quickPrompts: [
      "Quali prodotti consigliate in gravidanza?",
      "Quali prodotti per neonati dalla nascita?",
      "A quanto ammontano i costi di spedizione?",
    ],
    aiTyping: "L'assistente YUKIES sta scrivendo...",
  },
};

class YukiesChatWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.apiBase = this.getAttribute("api-base") || window.location.origin;
    this.isInline = this.getAttribute("mode") === "inline";
    this.position = this.getAttribute("position") || "bottom-right";

    // Language resolution
    const shopLocale = (window.YukiesCustomer && window.YukiesCustomer.locale) || "de";
    this.lang = UI_STRINGS[shopLocale] ? shopLocale : "de";

    this.session = null;
    this.ws = null;
    this.isSending = false;
    this.unreadCount = 0;

    // Load persistent state from localStorage
    this.state = this.loadPersistentState();
    this.isOpen = this.isInline ? true : (this.state.is_open || this.getAttribute("default-open") === "true");
    if (this.state.locale && UI_STRINGS[this.state.locale]) {
      this.lang = this.state.locale;
    }
  }

  connectedCallback() {
    this.isInline = this.getAttribute("mode") === "inline";
    if (this.isInline) this.isOpen = true;

    // If persistent session is stored, hydrate immediately
    if (this.state.session && this.state.session.user_id) {
      this.session = this.state.session;
      this.connectWebSocket(this.session.conversation_id);
    }

    this.render();
    this.bindEvents();

    // Verify session or auto-initialize if Shopify customer is logged in
    this.ensureSession().then(() => {
      this.render();
      this.bindEvents();
      this.scrollToBottom();
    });

    // Listen for customer auth changes
    window.addEventListener("yukies-customer-changed", () => {
      this.handleCustomerIdentityChange();
    });
  }

  disconnectedCallback() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Cross-Page Session Persistence (localStorage)
  // ---------------------------------------------------------------------------

  loadPersistentState() {
    try {
      const raw = localStorage.getItem(YUKIES_STORAGE_KEY);
      if (!raw) return { is_open: false, session: null, locale: this.lang };
      const parsed = JSON.parse(raw);

      // Check GDPR retention (180 days)
      if (parsed.timestamp) {
        const ageDays = (Date.now() - parsed.timestamp) / (1000 * 60 * 60 * 24);
        if (ageDays > RETENTION_DAYS) {
          localStorage.removeItem(YUKIES_STORAGE_KEY);
          return { is_open: false, session: null, locale: this.lang };
        }
      }
      return parsed;
    } catch (_) {
      return { is_open: false, session: null, locale: this.lang };
    }
  }

  savePersistentState() {
    try {
      const data = {
        is_open: this.isInline ? false : Boolean(this.isOpen),
        locale: this.lang,
        timestamp: Date.now(),
        session: this.session
          ? {
              user_id: this.session.user_id,
              conversation_id: this.session.conversation_id,
              full_name: this.session.full_name,
              email: this.session.email,
              is_logged_in_shopify: this.session.is_logged_in_shopify,
              status: this.session.status,
              assigned_agent: this.session.assigned_agent,
              messages: (this.session.messages || []).slice(-30), // keep recent 30 messages
            }
          : null,
      };
      localStorage.setItem(YUKIES_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn("YUKIES localStorage save error:", err);
    }
  }

  clearPersistentState() {
    try {
      localStorage.removeItem(YUKIES_STORAGE_KEY);
    } catch (_) {}
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.session = null;
    this.state = { is_open: this.isOpen, session: null, locale: this.lang };
    this.render();
    this.bindEvents();
  }

  async handleCustomerIdentityChange() {
    const cust = window.YukiesCustomer;
    // If logged-in customer changed or logged out
    if (cust && cust.id) {
      if (!this.session || this.session.shopify_customer_id !== String(cust.id)) {
        this.clearPersistentState();
        await this.ensureSession();
      }
    } else {
      // Switched to guest mode
      if (this.session && this.session.is_logged_in_shopify) {
        this.clearPersistentState();
      }
    }
    this.render();
    this.bindEvents();
  }

  // ---------------------------------------------------------------------------
  // Backend Session Initialization
  // ---------------------------------------------------------------------------

  async ensureSession() {
    const cust = window.YukiesCustomer;
    const isCustomerLoggedIn = Boolean(cust && cust.id && cust.email);

    if (isCustomerLoggedIn) {
      await this.initBackendSession({
        shopify_customer_id: String(cust.id),
        full_name: cust.full_name || "Kundin",
        email: cust.email,
        gdpr_consent: true,
        language: this.lang,
        conversation_id: this.session ? this.session.conversation_id : null,
      });
    } else if (this.session && this.session.email && this.session.full_name) {
      // Resume existing guest session
      await this.initBackendSession({
        shopify_customer_id: null,
        full_name: this.session.full_name,
        email: this.session.email,
        gdpr_consent: true,
        language: this.lang,
        conversation_id: this.session.conversation_id,
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
      const data = await res.json();

      // If resuming existing session with cached messages, merge smartly
      if (this.session && this.session.messages && this.session.messages.length > 0) {
        const serverIds = new Set(data.messages.map((m) => m.id));
        const merged = [...data.messages];
        for (const localMsg of this.session.messages) {
          if (!serverIds.has(localMsg.id)) {
            merged.push(localMsg);
          }
        }
        data.messages = merged;
      }

      this.session = data;
      this.savePersistentState();
      this.connectWebSocket(this.session.conversation_id);
    } catch (err) {
      console.error("YUKIES session init error:", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Real-Time WebSockets
  // ---------------------------------------------------------------------------

  connectWebSocket(conversationId) {
    if (!conversationId) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    try {
      const wsProto = this.apiBase.startsWith("https") ? "wss" : "ws";
      const hostPart = this.apiBase.replace(/^https?:\/\//, "");
      this.ws = new WebSocket(`${wsProto}://${hostPart}/ws/chat/${conversationId}`);

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!this.session) return;

          if (data.status) this.session.status = data.status;
          if ("assigned_agent" in data) this.session.assigned_agent = data.assigned_agent;

          if (data.message && (data.event === "human_agent_message" || data.event === "agent_takeover")) {
            const exists = this.session.messages.some((m) => m.id === data.message.id);
            if (!exists) {
              this.session.messages.push(data.message);
              if (!this.isOpen && !this.isInline) {
                this.unreadCount += 1;
              }
            }
          }
          this.savePersistentState();
          this.render();
          this.bindEvents();
          this.scrollToBottom();
        } catch (e) {
          console.error("YUKIES WS message error:", e);
        }
      };

      this.ws.onclose = () => {
        // Reconnect after 3 seconds if conversation still active
        setTimeout(() => {
          if (this.session && this.session.conversation_id) {
            this.connectWebSocket(this.session.conversation_id);
          }
        }, 3000);
      };
    } catch (err) {
      console.warn("YUKIES WebSocket connect warning:", err);
    }
  }

  // ---------------------------------------------------------------------------
  // Message Handling
  // ---------------------------------------------------------------------------

  async sendMessage(text) {
    if (!text || !text.trim() || !this.session || this.isSending) return;
    const cleanText = text.trim();
    this.isSending = true;

    const tempId = "temp-" + Date.now();
    this.session.messages.push({
      id: tempId,
      sender_type: "customer",
      sender_name: this.session.full_name,
      content: cleanText,
      referenced_products: [],
      created_at: new Date().toISOString(),
    });
    this.savePersistentState();
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

        // Replace optimistic message with persistent message from backend
        const idx = this.session.messages.findIndex((m) => m.id === tempId);
        if (idx !== -1) {
          this.session.messages[idx] = data.customer_message;
        } else {
          this.session.messages.push(data.customer_message);
        }

        if (data.reply_message) {
          const already = this.session.messages.some((m) => m.id === data.reply_message.id);
          if (!already) {
            this.session.messages.push(data.reply_message);
          }
        }
        this.savePersistentState();
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

  toggleOpen() {
    if (this.isInline) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.unreadCount = 0;
    }
    this.savePersistentState();
    this.render();
    this.bindEvents();
    if (this.isOpen) {
      this.scrollToBottom();
      setTimeout(() => {
        const input = this.shadowRoot.getElementById("yukies-chat-input");
        if (input) input.focus();
      }, 150);
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

  // ---------------------------------------------------------------------------
  // UI Rendering & Styling
  // ---------------------------------------------------------------------------

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
              <div class="yukies-product-meta">
                <span class="yukies-product-cert">${this.escapeHtml(p.certification || "COSMOS ORGANIC")}</span>
                <span class="yukies-product-title">${this.escapeHtml(p.title)}</span>
                <span class="yukies-product-size">${this.escapeHtml(p.size)}</span>
              </div>
              <div class="yukies-product-pricing">
                ${p.compare_at_price ? `<span class="yukies-price-compare">${this.escapeHtml(p.compare_at_price)}</span>` : ""}
                <span class="yukies-price-val">${this.escapeHtml(p.price)}</span>
                <span class="yukies-stock-badge ${p.available ? "in-stock" : "out-stock"}">
                  ${p.available ? t.inStock : t.outOfStock}
                </span>
              </div>
            </div>
            <p class="yukies-product-desc">${this.escapeHtml(p.short_description)}</p>
            <a class="yukies-product-btn" href="${this.escapeHtml(p.product_url)}" target="_blank" rel="noopener noreferrer">
              <span>${t.viewProductBtn}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
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
    const isCustomer = Boolean(this.session && this.session.is_logged_in_shopify);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          --yk-bg: #FAF7F2;
          --yk-surface: #FFFFFF;
          --yk-primary: #2E3B32;
          --yk-primary-hover: #222C25;
          --yk-accent: #C7B299;
          --yk-border: #E8E2D8;
          --yk-text: #232321;
          --yk-muted: #6B6760;
          --yk-agent-bg: #EEF5F0;
          --yk-shadow: 0 16px 40px rgba(46, 59, 50, 0.16);
          --yk-radius: 18px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: var(--yk-text);
          display: block;
          -webkit-font-smoothing: antialiased;
        }

        /* ------------------------------------------------------------- */
        /* Floating Launcher Button (Dawn 7.0 embedded)                  */
        /* ------------------------------------------------------------- */
        .yukies-launcher-bubble {
          position: fixed;
          ${this.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
          bottom: 24px;
          z-index: 2147483640;
          display: ${this.isInline ? "none" : "flex"};
          align-items: center;
          gap: 10px;
          background: var(--yk-primary);
          color: #FAF7F2;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 13px 20px;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(46, 59, 50, 0.28);
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .yukies-launcher-bubble:hover {
          transform: translateY(-2px);
          background: var(--yk-primary-hover);
          box-shadow: 0 14px 34px rgba(46, 59, 50, 0.34);
        }
        .yukies-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #8ED1A1;
          box-shadow: 0 0 0 0 rgba(142, 209, 161, 0.7);
          animation: yk-pulse 2s infinite;
        }
        @keyframes yk-pulse {
          0% { box-shadow: 0 0 0 0 rgba(142, 209, 161, 0.7); }
          70% { box-shadow: 0 0 0 7px rgba(142, 209, 161, 0); }
          100% { box-shadow: 0 0 0 0 rgba(142, 209, 161, 0); }
        }
        .yukies-unread-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #C84630;
          color: #FFF;
          font-size: 10px;
          font-weight: bold;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FAF7F2;
        }

        /* ------------------------------------------------------------- */
        /* Drawer Window                                                 */
        /* ------------------------------------------------------------- */
        .yukies-drawer {
          ${
            this.isInline
              ? `
            position: relative;
            width: 100%;
            height: 620px;
            display: flex;
          `
              : `
            position: fixed;
            ${this.position === "bottom-left" ? "left: 24px;" : "right: 24px;"}
            bottom: 86px;
            width: 410px;
            max-width: calc(100vw - 32px);
            height: 640px;
            max-height: calc(100vh - 110px);
            display: ${this.isOpen ? "flex" : "none"};
            z-index: 2147483645;
            animation: yk-drawer-open 0.24s cubic-bezier(0.16, 1, 0.3, 1);
          `
          }
          background: var(--yk-bg);
          border: 1px solid var(--yk-border);
          border-radius: var(--yk-radius);
          box-shadow: var(--yk-shadow);
          flex-direction: column;
          overflow: hidden;
        }
        @keyframes yk-drawer-open {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 600px) {
          .yukies-drawer {
            ${
              this.isInline
                ? ""
                : `
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              width: 100vw;
              max-width: 100vw;
              height: 100vh;
              max-height: 100vh;
              border-radius: 0;
              border: none;
            `
            }
          }
        }

        /* ------------------------------------------------------------- */
        /* Header                                                        */
        /* ------------------------------------------------------------- */
        .yukies-header {
          background: var(--yk-primary);
          color: #FAF7F2;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .yukies-header-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .yukies-brand-title {
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .yukies-brand-sub {
          font-size: 11.5px;
          color: #D3DDD5;
          margin-top: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .yukies-header-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .yukies-lang-pills {
          display: flex;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .yukies-lang-btn {
          background: transparent;
          color: #E2ECE5;
          border: none;
          padding: 3px 6px;
          font-size: 10.5px;
          font-weight: 600;
          border-radius: 999px;
          cursor: pointer;
          line-height: 1;
        }
        .yukies-lang-btn.active {
          background: #FAF7F2;
          color: var(--yk-primary);
        }
        .yukies-icon-btn {
          background: transparent;
          border: none;
          color: #FAF7F2;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.85;
          transition: opacity 0.15s, background 0.15s;
        }
        .yukies-icon-btn:hover {
          opacity: 1;
          background: rgba(255, 255, 255, 0.12);
        }

        /* ------------------------------------------------------------- */
        /* User Profile Status Bar                                       */
        /* ------------------------------------------------------------- */
        .yukies-user-status-bar {
          background: #F2ECE2;
          border-bottom: 1px solid var(--yk-border);
          padding: 7px 16px;
          font-size: 11.5px;
          color: var(--yk-muted);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .yukies-user-id-code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 10px;
          background: rgba(46, 59, 50, 0.08);
          padding: 2px 5px;
          border-radius: 4px;
          color: var(--yk-primary);
        }

        /* ------------------------------------------------------------- */
        /* Messages Body                                                 */
        /* ------------------------------------------------------------- */
        .yukies-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .yukies-bubble {
          max-width: 86%;
          padding: 11px 14px;
          border-radius: 14px;
          font-size: 13.5px;
          line-height: 1.52;
          word-break: break-word;
          position: relative;
        }
        .yukies-bubble.ai {
          align-self: flex-start;
          background: var(--yk-surface);
          border: 1px solid var(--yk-border);
          border-bottom-left-radius: 3px;
          color: var(--yk-text);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
        }
        .yukies-bubble.customer {
          align-self: flex-end;
          background: var(--yk-primary);
          color: #FAF7F2;
          border-bottom-right-radius: 3px;
        }
        .yukies-bubble.human_agent {
          align-self: flex-start;
          background: var(--yk-agent-bg);
          border: 1px solid #B8D6C0;
          border-bottom-left-radius: 3px;
        }
        .yukies-bubble.system {
          align-self: center;
          background: #ECE7DE;
          color: var(--yk-muted);
          font-size: 11px;
          padding: 6px 12px;
          border-radius: 999px;
          max-width: 90%;
          text-align: center;
        }
        .yukies-agent-title {
          font-size: 10.5px;
          font-weight: 600;
          color: #215A33;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        /* ------------------------------------------------------------- */
        /* Product Cards inside Chat                                     */
        /* ------------------------------------------------------------- */
        .yukies-product-cards {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 10px;
        }
        .yukies-product-card {
          background: #FAF7F2;
          border: 1px solid var(--yk-border);
          border-radius: 12px;
          padding: 11px 13px;
        }
        .yukies-product-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }
        .yukies-product-meta {
          display: flex;
          flex-direction: column;
        }
        .yukies-product-cert {
          font-size: 9.5px;
          text-transform: uppercase;
          color: #4C6853;
          font-weight: 600;
          letter-spacing: 0.04em;
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
        .yukies-product-pricing {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .yukies-price-compare {
          font-size: 11px;
          text-decoration: line-through;
          color: var(--yk-muted);
        }
        .yukies-price-val {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--yk-text);
        }
        .yukies-stock-badge {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: 2px;
          font-weight: 500;
        }
        .yukies-stock-badge.in-stock {
          background: #E3EFE6;
          color: #215A33;
        }
        .yukies-stock-badge.out-stock {
          background: #FCE8E6;
          color: #8C2519;
        }
        .yukies-product-desc {
          font-size: 11.5px;
          color: var(--yk-muted);
          margin: 6px 0 9px 0;
          line-height: 1.42;
        }
        .yukies-product-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--yk-primary);
          text-decoration: none;
          border-bottom: 1px solid var(--yk-primary);
          padding-bottom: 1px;
        }
        .yukies-product-btn:hover {
          color: var(--yk-accent);
          border-bottom-color: var(--yk-accent);
        }

        /* ------------------------------------------------------------- */
        /* Quick Prompt Suggestions                                      */
        /* ------------------------------------------------------------- */
        .yukies-quick-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .yukies-quick-chip {
          background: var(--yk-surface);
          border: 1px solid var(--yk-border);
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 11.5px;
          color: var(--yk-primary);
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }
        .yukies-quick-chip:hover {
          background: #F2ECE2;
          border-color: #D8D0C3;
        }

        /* ------------------------------------------------------------- */
        /* Chat Input Footer                                             */
        /* ------------------------------------------------------------- */
        .yukies-footer {
          padding: 12px 14px;
          background: var(--yk-surface);
          border-top: 1px solid var(--yk-border);
          display: flex;
          gap: 8px;
        }
        .yukies-input-box {
          flex: 1;
          border: 1px solid var(--yk-border);
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 13.5px;
          outline: none;
          background: var(--yk-bg);
          color: var(--yk-text);
          box-sizing: border-box;
          font-family: inherit;
        }
        .yukies-input-box:focus {
          border-color: var(--yk-primary);
          background: #FFFFFF;
        }
        .yukies-send-button {
          background: var(--yk-primary);
          color: #FAF7F2;
          border: none;
          border-radius: 10px;
          padding: 0 18px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .yukies-send-button:hover:not(:disabled) {
          background: var(--yk-primary-hover);
        }
        .yukies-send-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        /* ------------------------------------------------------------- */
        /* Pre-Chat Form (DSGVO Consent)                                 */
        /* ------------------------------------------------------------- */
        .yukies-prechat-wrap {
          padding: 24px 22px;
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .yukies-prechat-wrap h3 {
          margin: 0 0 6px 0;
          font-size: 17px;
          font-weight: 600;
          color: var(--yk-primary);
        }
        .yukies-prechat-wrap p {
          margin: 0 0 16px 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: var(--yk-muted);
        }
        .yukies-form-group {
          margin-bottom: 12px;
        }
        .yukies-form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 4px;
        }
        .yukies-form-group input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid var(--yk-border);
          border-radius: 10px;
          background: var(--yk-surface);
          font-size: 13.5px;
          outline: none;
        }
        .yukies-consent-row {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin: 12px 0 18px 0;
          font-size: 11px;
          line-height: 1.45;
          color: var(--yk-muted);
        }
        .yukies-start-btn {
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
      </style>

      <!-- Floating Launcher Button -->
      <button class="yukies-launcher-bubble" id="yk-launcher">
        <span class="yukies-pulse-dot"></span>
        <span>${this.escapeHtml(t.launcherText)}</span>
        ${this.unreadCount > 0 ? `<span class="yukies-unread-badge">${this.unreadCount}</span>` : ""}
      </button>

      <!-- Drawer Panel -->
      <div class="yukies-drawer" role="dialog" aria-label="YUKIES Chat">
        <div class="yukies-header">
          <div class="yukies-header-brand">
            <div>
              <div class="yukies-brand-title">${this.escapeHtml(t.brandName)}</div>
              <div class="yukies-brand-sub">${this.renderStatusBadge(t)}</div>
            </div>
          </div>
          <div class="yukies-header-actions">
            <div class="yukies-lang-pills">
              <button class="yukies-lang-btn ${this.lang === "de" ? "active" : ""}" data-lang="de">DE</button>
              <button class="yukies-lang-btn ${this.lang === "en" ? "active" : ""}" data-lang="en">EN</button>
              <button class="yukies-lang-btn ${this.lang === "fr" ? "active" : ""}" data-lang="fr">FR</button>
              <button class="yukies-lang-btn ${this.lang === "it" ? "active" : ""}" data-lang="it">IT</button>
            </div>
            ${
              isIdentified
                ? `<button class="yukies-icon-btn" id="yk-new-chat-btn" title="${this.escapeHtml(t.newChatBtn)}">
                     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                       <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                     </svg>
                   </button>`
                : ""
            }
            <button class="yukies-icon-btn" id="yk-close-btn" title="${this.escapeHtml(t.closeBtn)}">&times;</button>
          </div>
        </div>

        ${
          isIdentified
            ? `
          <div class="yukies-user-status-bar">
            <span>${isCustomer ? t.loggedInBadge : t.guestBadge} <strong>${this.escapeHtml(this.session.full_name)}</strong></span>
            <span class="yukies-user-id-code">DSGVO ID: ${this.escapeHtml(this.session.user_id.slice(0, 8))}</span>
          </div>

          <div class="yukies-messages">
            ${this.session.messages
              .map(
                (m) => `
              <div class="yukies-bubble ${this.escapeHtml(m.sender_type)}">
                ${
                  m.sender_type === "human_agent"
                    ? `<div class="yukies-agent-title">${this.escapeHtml(m.sender_name)} (YUKIES Team)</div>`
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
              <div class="yukies-quick-prompts">
                ${t.quickPrompts
                  .map(
                    (qp) =>
                      `<button class="yukies-quick-chip" data-prompt="${this.escapeHtml(qp)}">${this.escapeHtml(qp)}</button>`
                  )
                  .join("")}
              </div>
            `
                : ""
            }

            ${this.isSending ? `<div class="yukies-bubble system">${this.escapeHtml(t.aiTyping)}</div>` : ""}
          </div>

          <form class="yukies-footer" id="yk-chat-form">
            <input
              type="text"
              class="yukies-input-box"
              id="yukies-chat-input"
              placeholder="${this.escapeHtml(t.inputPlaceholder)}"
              autocomplete="off"
              ${this.isSending ? "disabled" : ""}
            />
            <button type="submit" class="yukies-send-button" ${this.isSending ? "disabled" : ""}>
              ${this.escapeHtml(t.sendBtn)}
            </button>
          </form>
        `
            : `
          <form class="yukies-prechat-wrap" id="yk-prechat-form">
            <h3>${this.escapeHtml(t.prechatTitle)}</h3>
            <p>${this.escapeHtml(t.prechatIntro)}</p>

            <div class="yukies-form-group">
              <label for="yk-input-name">${this.escapeHtml(t.nameLabel)}</label>
              <input type="text" id="yk-input-name" required placeholder="${this.escapeHtml(t.namePlaceholder)}" />
            </div>

            <div class="yukies-form-group">
              <label for="yk-input-email">${this.escapeHtml(t.emailLabel)}</label>
              <input type="email" id="yk-input-email" required placeholder="${this.escapeHtml(t.emailPlaceholder)}" />
            </div>

            <label class="yukies-consent-row">
              <input type="checkbox" id="yk-input-consent" required checked />
              <span>${this.escapeHtml(t.consentLabel)}</span>
            </label>

            <button type="submit" class="yukies-start-btn">${this.escapeHtml(t.startBtn)}</button>
          </form>
        `
        }
      </div>
    `;
  }

  bindEvents() {
    const launcher = this.shadowRoot.getElementById("yk-launcher");
    if (launcher) launcher.onclick = () => this.toggleOpen();

    const closeBtn = this.shadowRoot.getElementById("yk-close-btn");
    if (closeBtn) closeBtn.onclick = () => this.toggleOpen();

    const newChatBtn = this.shadowRoot.getElementById("yk-new-chat-btn");
    if (newChatBtn) {
      newChatBtn.onclick = () => {
        if (confirm("Möchtest du eine neue Beratung starten? Der bisherige Chatverlauf wird archiviert.")) {
          this.clearPersistentState();
          this.ensureSession().then(() => {
            this.render();
            this.bindEvents();
          });
        }
      };
    }

    // Language pills
    const langBtns = this.shadowRoot.querySelectorAll(".yukies-lang-btn");
    langBtns.forEach((btn) => {
      btn.onclick = () => {
        const selected = btn.getAttribute("data-lang");
        if (selected && UI_STRINGS[selected]) {
          this.lang = selected;
          this.savePersistentState();
          this.render();
          this.bindEvents();
        }
      };
    });

    // Guest pre-chat submission
    const prechatForm = this.shadowRoot.getElementById("yk-prechat-form");
    if (prechatForm) {
      prechatForm.onsubmit = async (e) => {
        e.preventDefault();
        const nameEl = this.shadowRoot.getElementById("yk-input-name");
        const emailEl = this.shadowRoot.getElementById("yk-input-email");
        const consentEl = this.shadowRoot.getElementById("yk-input-consent");
        if (!nameEl.value.trim() || !emailEl.value.trim() || !consentEl.checked) return;

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

    // Chat message form submission
    const chatForm = this.shadowRoot.getElementById("yk-chat-form");
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

    // Quick prompt chips
    const quickChips = this.shadowRoot.querySelectorAll(".yukies-quick-chip");
    quickChips.forEach((chip) => {
      chip.onclick = () => {
        const prompt = chip.getAttribute("data-prompt");
        if (prompt) this.sendMessage(prompt);
      };
    });
  }
}

if (!customElements.get("yukies-chat-widget")) {
  customElements.define("yukies-chat-widget", YukiesChatWidget);
}
