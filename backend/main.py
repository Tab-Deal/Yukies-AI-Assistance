from contextlib import asynccontextmanager
from datetime import datetime, timezone
import hashlib
import json
from fastapi import Depends, FastAPI, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.config import settings
from backend.database import AsyncSession, get_db, init_db
from backend.models import AuditLog, ConsentRecord, Conversation, Message, User
from backend.schemas import (
    AgentMessageRequest,
    AgentTakeoverRequest,
    ChatMessageRequest,
    ChatMessageResponse,
    MessageItemSchema,
    ProductCardSchema,
    SessionInitRequest,
    SessionInitResponse,
)
from backend.services.gemini_assistant import gemini_assistant
from backend.services.handoff_service import handoff_notifier, ws_manager
from backend.services.shopify_client import shopify_client


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="YUKIES AI Shopping Companion & Customer Support API",
    version="1.1.0",
    description="Read-Only AI Shopping Companion & Support Interface for yukies.at (Shopify Dawn 7.0) compliant with Austrian DSG & EU GDPR.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _hash_ip(request: Request) -> str:
    client_host = request.client.host if request.client else "0.0.0.0"
    return hashlib.sha256(f"yukies-dsg-salt:{client_host}".encode("utf-8")).hexdigest()[:32]


def _serialize_message(msg: Message) -> MessageItemSchema:
    try:
        raw_cards = json.loads(msg.referenced_products_json or "[]")
        cards = [ProductCardSchema(**c) for c in raw_cards]
    except Exception:
        cards = []
    return MessageItemSchema(
        id=msg.id,
        conversation_id=msg.conversation_id,
        user_id=msg.user_id,
        sender_type=msg.sender_type,
        sender_name=msg.sender_name,
        content=msg.content,
        referenced_products=cards,
        created_at=msg.created_at,
    )


def _build_welcome_message(lang: str, full_name: str, is_logged_in: bool) -> str:
    first_name = full_name.strip().split()[0] if full_name.strip() else ""
    if lang == "en":
        greeting = f"Hello {first_name}," if first_name else "Hello,"
        return (
            f"{greeting} welcome to YUKIES. I am your personal shopping advisor for our handmade natural cosmetics from Vienna. "
            "How may I help you with our products, ingredients, gifts, or your order today?"
        )
    if lang == "fr":
        greeting = f"Bonjour {first_name}," if first_name else "Bonjour,"
        return (
            f"{greeting} bienvenue chez YUKIES. Je suis votre conseiller pour nos cosmétiques naturels fabriqués à la main à Vienne. "
            "Comment puis-je vous aider aujourd'hui ?"
        )
    if lang == "it":
        greeting = f"Ciao {first_name}," if first_name else "Ciao,"
        return (
            f"{greeting} benvenuta da YUKIES. Sono il tuo assistente per la nostra cosmesi naturale fatta a mano a Vienna. "
            "Come posso aiutarti oggi?"
        )
    greeting = f"Hallo {first_name}," if first_name else "Hallo,"
    return (
        f"{greeting} herzlich willkommen bei YUKIES. Ich berate dich gerne zu unserer in Wien handgefertigten Naturkosmetik für Babys, Kinder und Mamas sowie zu Versand und Bestellungen. "
        "Wie kann ich dir heute helfen?"
    )


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "store": settings.STORE_NAME,
        "domain": settings.STORE_DOMAIN,
        "theme": "Shopify Dawn 7.0",
        "gemini_model": settings.GEMINI_MODEL,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "compliance": ["EU-GDPR", "AT-DSG", "EU-Cosmetics-Claims-09_formulierungen"],
    }


@app.get("/api/products", response_model=list[ProductCardSchema])
async def list_products():
    return await shopify_client.get_all_products()


@app.post("/api/chat/session", response_model=SessionInitResponse)
async def initialize_or_resume_session(
    payload: SessionInitRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Smart Onboarding Gate (FR-002):
    - Logged-in Shopify customer: auto-detected via shopify_customer_id, no pre-chat form needed.
    - Guest visitor: requires Name + Email + explicit DSG/GDPR consent.
    - Persists all chats under a unique User ID.
    """
    is_shopify_login = bool(
        payload.shopify_customer_id and payload.shopify_customer_id.strip()
    )
    if not is_shopify_login and not payload.gdpr_consent:
        raise HTTPException(
            status_code=400,
            detail="Für Gäste ist die Zustimmung zur Datenschutzerklärung (DSGVO / DSG) erforderlich.",
        )

    norm_email = str(payload.email).strip().lower()
    clean_name = payload.full_name.strip()

    user: User | None = None
    if is_shopify_login:
        stmt = select(User).where(
            User.shopify_customer_id == payload.shopify_customer_id.strip()
        )
        user = (await db.execute(stmt)).scalar_one_or_none()

    if user is None:
        stmt = select(User).where(User.email == norm_email)
        user = (await db.execute(stmt)).scalar_one_or_none()

    if user is None:
        user = User(
            shopify_customer_id=(
                payload.shopify_customer_id.strip() if is_shopify_login else None
            ),
            email=norm_email,
            full_name=clean_name,
            preferred_language=payload.language,
            address_form="du",
            is_logged_in_shopify=is_shopify_login,
        )
        db.add(user)
        await db.flush()
    else:
        user.full_name = clean_name or user.full_name
        user.preferred_language = payload.language
        if is_shopify_login:
            user.shopify_customer_id = payload.shopify_customer_id.strip()
            user.is_logged_in_shopify = True

    # Log auditable DSG/GDPR Consent Record
    consent = ConsentRecord(
        user_id=user.id,
        consent_version=settings.CONSENT_VERSION,
        consent_text=payload.consent_text,
        auth_source="shopify_login" if is_shopify_login else "guest_prechat_form",
        ip_hash=_hash_ip(request),
    )
    db.add(consent)

    db.add(
        AuditLog(
            actor=user.email,
            action="user_session_initialized",
            target_user_id=user.id,
            details_json=json.dumps(
                {
                    "auth_source": consent.auth_source,
                    "consent_version": settings.CONSENT_VERSION,
                    "language": payload.language,
                }
            ),
        )
    )

    # Find existing active conversation for this User ID or create a new one
    conversation: Conversation | None = None
    if payload.conversation_id:
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(
                Conversation.id == payload.conversation_id,
                Conversation.user_id == user.id,
            )
        )
        conversation = (await db.execute(stmt)).scalar_one_or_none()

    if conversation is None:
        stmt = (
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(
                Conversation.user_id == user.id,
                Conversation.status != "resolved",
            )
            .order_by(Conversation.updated_at.desc())
        )
        conversation = (await db.execute(stmt)).scalars().first()

    welcome_text = _build_welcome_message(
        payload.language, user.full_name, is_shopify_login
    )

    if conversation is None:
        conversation = Conversation(
            user_id=user.id,
            language=payload.language,
            address_form=user.address_form,
            status="ai_active",
        )
        db.add(conversation)
        await db.flush()

        welcome_msg = Message(
            conversation_id=conversation.id,
            user_id=user.id,
            sender_type="ai",
            sender_name="YUKIES Assistent",
            content=welcome_text,
            referenced_products_json="[]",
        )
        db.add(welcome_msg)
        await db.commit()
        await db.refresh(conversation, attribute_names=["messages"])
    else:
        await db.commit()

    serialized_msgs = [_serialize_message(m) for m in conversation.messages]

    await ws_manager.broadcast_to_admins(
        {
            "event": "session_updated",
            "conversation_id": conversation.id,
            "user_id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "status": conversation.status,
        }
    )

    return SessionInitResponse(
        user_id=user.id,
        conversation_id=conversation.id,
        full_name=user.full_name,
        email=user.email,
        is_logged_in_shopify=user.is_logged_in_shopify,
        language=conversation.language,  # type: ignore[arg-type]
        address_form=conversation.address_form,  # type: ignore[arg-type]
        status=conversation.status,  # type: ignore[arg-type]
        assigned_agent=conversation.assigned_agent,
        welcome_message=welcome_text,
        messages=serialized_msgs,
    )


@app.post("/api/chat/message", response_model=ChatMessageResponse)
async def send_customer_message(
    payload: ChatMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Conversation)
        .options(selectinload(Conversation.messages), selectinload(Conversation.user))
        .where(
            Conversation.id == payload.conversation_id,
            Conversation.user_id == payload.user_id,
        )
    )
    conversation = (await db.execute(stmt)).scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    user = conversation.user

    # 1. Persist customer message under User ID
    cust_msg = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        sender_type="customer",
        sender_name=user.full_name,
        content=payload.message.strip(),
        referenced_products_json="[]",
    )
    db.add(cust_msg)
    conversation.updated_at = datetime.now(timezone.utc)
    await db.flush()

    cust_msg_schema = _serialize_message(cust_msg)

    # Notify Live Agent Panel & customer sockets immediately
    await ws_manager.broadcast_to_admins(
        {
            "event": "new_message",
            "conversation_id": conversation.id,
            "status": conversation.status,
            "message": cust_msg_schema.model_dump(mode="json"),
        }
    )

    # 2. If a human agent (Silvia or Barbara) is currently active in Live Chat, do NOT send conflicting AI responses (FR-029)
    if conversation.status == "agent_active":
        await db.commit()
        return ChatMessageResponse(
            conversation_id=conversation.id,
            user_id=user.id,
            status=conversation.status,  # type: ignore[arg-type]
            assigned_agent=conversation.assigned_agent,
            language=conversation.language,  # type: ignore[arg-type]
            address_form=conversation.address_form,  # type: ignore[arg-type]
            customer_message=cust_msg_schema,
            reply_message=None,
            handover_triggered=False,
        )

    # 3. Run YUKIES Gemini Assistant with 3-Layer Guardrails
    history_dicts = [
        {"sender_type": m.sender_type, "content": m.content}
        for m in conversation.messages
        if m.id != cust_msg.id
    ]
    turn = await gemini_assistant.generate_turn(
        user_message=cust_msg.content,
        customer_name=user.full_name,
        customer_email=user.email,
        shopify_customer_id=user.shopify_customer_id,
        is_logged_in=user.is_logged_in_shopify,
        current_language=payload.language or conversation.language,
        current_address_form=conversation.address_form,
        conversation_history=history_dicts,
    )

    conversation.language = turn.language
    conversation.address_form = turn.address_form
    user.preferred_language = turn.language
    user.address_form = turn.address_form

    cards_json = json.dumps(
        [c.model_dump(mode="json") for c in turn.referenced_products],
        ensure_ascii=False,
    )
    ai_msg = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        sender_type="ai",
        sender_name="YUKIES Assistent",
        content=turn.reply_text,
        referenced_products_json=cards_json,
        guardrail_notes_json=json.dumps(turn.guardrail_notes, ensure_ascii=False),
    )
    db.add(ai_msg)

    # 4. Handle Escalation / Human Handoff (Option B: Email to office@bacciorganics.com + Live Agent Inbox)
    if turn.handover_triggered:
        conversation.status = "waiting_for_agent"
        conversation.escalation_reason = (
            turn.handover_reason or "Übergabe an das YUKIES Team"
        )
        conversation.ai_summary = (
            f"Kundin/Kunde {user.full_name} ({user.email}): {cust_msg.content[:220]}"
        )
        transcript_lines = [
            f"[{m.sender_name}]: {m.content}" for m in conversation.messages
        ] + [f"[YUKIES Assistent]: {turn.reply_text}"]

        await handoff_notifier.send_escalation_email(
            conversation_id=conversation.id,
            user_id=user.id,
            customer_name=user.full_name,
            customer_email=user.email,
            language=conversation.language,
            reason=conversation.escalation_reason,
            summary=conversation.ai_summary,
            transcript_lines=transcript_lines,
        )
        db.add(
            AuditLog(
                actor="YUKIES Assistent",
                action="human_handoff_triggered",
                target_user_id=user.id,
                details_json=json.dumps(
                    {
                        "conversation_id": conversation.id,
                        "reason": conversation.escalation_reason,
                        "notified": [
                            settings.SUPPORT_EMAIL_PRIMARY,
                            settings.SUPPORT_EMAIL_SECONDARY,
                        ],
                    },
                    ensure_ascii=False,
                ),
            )
        )

    await db.commit()
    await db.refresh(ai_msg)
    ai_msg_schema = _serialize_message(ai_msg)

    await ws_manager.broadcast_to_conversation(
        conversation.id,
        {
            "event": "ai_message",
            "conversation_id": conversation.id,
            "status": conversation.status,
            "message": ai_msg_schema.model_dump(mode="json"),
        },
    )
    await ws_manager.broadcast_to_admins(
        {
            "event": "conversation_updated",
            "conversation_id": conversation.id,
            "status": conversation.status,
            "escalation_reason": conversation.escalation_reason,
            "message": ai_msg_schema.model_dump(mode="json"),
        }
    )

    return ChatMessageResponse(
        conversation_id=conversation.id,
        user_id=user.id,
        status=conversation.status,  # type: ignore[arg-type]
        assigned_agent=conversation.assigned_agent,
        language=conversation.language,  # type: ignore[arg-type]
        address_form=conversation.address_form,  # type: ignore[arg-type]
        customer_message=cust_msg_schema,
        reply_message=ai_msg_schema,
        handover_triggered=turn.handover_triggered,
        handover_reason=conversation.escalation_reason,
    )


# ---------------------------------------------------------------------------
# Admin & Live Chat Agent Inbox Endpoints (Silvia Ragucci & Barbara)
# ---------------------------------------------------------------------------


@app.get("/api/admin/conversations")
async def admin_list_conversations(db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Conversation)
        .options(selectinload(Conversation.user), selectinload(Conversation.messages))
        .order_by(Conversation.updated_at.desc())
    )
    convs = (await db.execute(stmt)).scalars().all()
    items = []
    for c in convs:
        last_msg = c.messages[-1].content if c.messages else ""
        items.append(
            {
                "conversation_id": c.id,
                "user_id": c.user_id,
                "customer_name": c.user.full_name,
                "customer_email": c.user.email,
                "shopify_customer_id": c.user.shopify_customer_id,
                "is_logged_in_shopify": c.user.is_logged_in_shopify,
                "language": c.language,
                "address_form": c.address_form,
                "status": c.status,
                "assigned_agent": c.assigned_agent,
                "escalation_reason": c.escalation_reason,
                "ai_summary": c.ai_summary,
                "message_count": len(c.messages),
                "last_message_preview": last_msg[:120],
                "updated_at": c.updated_at.isoformat(),
            }
        )
    return {
        "conversations": items,
        "support_agents": settings.support_agents_list,
        "email_outbox_count": len(handoff_notifier.outbox_log),
    }


@app.get("/api/admin/conversations/{conversation_id}")
async def admin_get_conversation_detail(
    conversation_id: str, db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Conversation)
        .options(
            selectinload(Conversation.user).selectinload(User.consents),
            selectinload(Conversation.messages),
        )
        .where(Conversation.id == conversation_id)
    )
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    return {
        "conversation_id": conv.id,
        "status": conv.status,
        "language": conv.language,
        "address_form": conv.address_form,
        "assigned_agent": conv.assigned_agent,
        "escalation_reason": conv.escalation_reason,
        "ai_summary": conv.ai_summary,
        "user": {
            "user_id": conv.user.id,
            "full_name": conv.user.full_name,
            "email": conv.user.email,
            "shopify_customer_id": conv.user.shopify_customer_id,
            "is_logged_in_shopify": conv.user.is_logged_in_shopify,
            "created_at": conv.user.created_at.isoformat(),
            "consents": [
                {
                    "consent_version": cr.consent_version,
                    "auth_source": cr.auth_source,
                    "accepted_at": cr.accepted_at.isoformat(),
                }
                for cr in conv.user.consents
            ],
        },
        "messages": [
            _serialize_message(m).model_dump(mode="json") for m in conv.messages
        ],
        "outbox_notifications": [
            n
            for n in handoff_notifier.outbox_log
            if n["conversation_id"] == conversation_id
        ],
    }


@app.post("/api/admin/conversations/{conversation_id}/takeover")
async def admin_takeover_conversation(
    conversation_id: str,
    payload: AgentTakeoverRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Conversation)
        .options(selectinload(Conversation.user))
        .where(Conversation.id == conversation_id)
    )
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.status = "agent_active"
    conv.assigned_agent = payload.agent_name.strip()
    conv.updated_at = datetime.now(timezone.utc)

    sys_msg = Message(
        conversation_id=conv.id,
        user_id=conv.user_id,
        sender_type="system",
        sender_name=conv.assigned_agent,
        content=(
            f"{conv.assigned_agent} hat das Gespräch übernommen."
            if conv.language == "de"
            else f"{conv.assigned_agent} has joined the conversation."
        ),
        referenced_products_json="[]",
    )
    db.add(sys_msg)
    db.add(
        AuditLog(
            actor=conv.assigned_agent,
            action="agent_takeover",
            target_user_id=conv.user_id,
            details_json=json.dumps({"conversation_id": conv.id}),
        )
    )
    await db.commit()
    await db.refresh(sys_msg)

    msg_data = _serialize_message(sys_msg).model_dump(mode="json")
    await ws_manager.broadcast_to_conversation(
        conv.id,
        {
            "event": "agent_takeover",
            "conversation_id": conv.id,
            "status": conv.status,
            "assigned_agent": conv.assigned_agent,
            "message": msg_data,
        },
    )
    await ws_manager.broadcast_to_admins(
        {
            "event": "agent_takeover",
            "conversation_id": conv.id,
            "status": conv.status,
            "assigned_agent": conv.assigned_agent,
        }
    )
    return {
        "status": conv.status,
        "assigned_agent": conv.assigned_agent,
        "system_message": msg_data,
    }


@app.post("/api/admin/conversations/{conversation_id}/message")
async def admin_send_live_message(
    conversation_id: str,
    payload: AgentMessageRequest,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.status = "agent_active"
    conv.assigned_agent = payload.agent_name.strip()
    conv.updated_at = datetime.now(timezone.utc)

    agent_msg = Message(
        conversation_id=conv.id,
        user_id=conv.user_id,
        sender_type="human_agent",
        sender_name=conv.assigned_agent,
        content=payload.content.strip(),
        referenced_products_json="[]",
    )
    db.add(agent_msg)
    await db.commit()
    await db.refresh(agent_msg)

    msg_data = _serialize_message(agent_msg).model_dump(mode="json")
    await ws_manager.broadcast_to_conversation(
        conv.id,
        {
            "event": "human_agent_message",
            "conversation_id": conv.id,
            "status": conv.status,
            "assigned_agent": conv.assigned_agent,
            "message": msg_data,
        },
    )
    await ws_manager.broadcast_to_admins(
        {
            "event": "human_agent_message",
            "conversation_id": conv.id,
            "status": conv.status,
            "message": msg_data,
        }
    )
    return {"status": conv.status, "message": msg_data}


@app.post("/api/admin/conversations/{conversation_id}/return-to-ai")
async def admin_return_to_ai(
    conversation_id: str, db: AsyncSession = Depends(get_db)
):
    stmt = select(Conversation).where(Conversation.id == conversation_id)
    conv = (await db.execute(stmt)).scalar_one_or_none()
    if conv is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    conv.status = "ai_active"
    conv.assigned_agent = None
    conv.updated_at = datetime.now(timezone.utc)
    await db.commit()

    await ws_manager.broadcast_to_conversation(
        conv.id,
        {
            "event": "status_changed",
            "conversation_id": conv.id,
            "status": conv.status,
            "assigned_agent": None,
        },
    )
    await ws_manager.broadcast_to_admins(
        {
            "event": "status_changed",
            "conversation_id": conv.id,
            "status": conv.status,
        }
    )
    return {"status": conv.status}


# ---------------------------------------------------------------------------
# Austrian DSG & EU GDPR Compliance Endpoints (Art. 15 Export & Art. 17 Erase)
# ---------------------------------------------------------------------------


@app.get("/api/admin/gdpr/export/{user_id}")
async def gdpr_export_user_data(
    user_id: str, db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(User)
        .options(
            selectinload(User.consents),
            selectinload(User.conversations).selectinload(Conversation.messages),
        )
        .where(User.id == user_id)
    )
    user = (await db.execute(stmt)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User ID not found.")

    db.add(
        AuditLog(
            actor="YUKIES Admin",
            action="gdpr_data_exported",
            target_user_id=user.id,
            details_json=json.dumps({"standard": "EU-GDPR Art. 15 / AT-DSG"}),
        )
    )
    await db.commit()

    return JSONResponse(
        content={
            "compliance_standard": "EU GDPR Art. 15 & Austrian DSG (§ 44) Data Subject Export",
            "exported_at_utc": datetime.now(timezone.utc).isoformat(),
            "store": "Yukies by Bacci Organics e.U., Wien",
            "user_profile": {
                "user_id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "shopify_customer_id": user.shopify_customer_id,
                "preferred_language": user.preferred_language,
                "address_form": user.address_form,
                "created_at": user.created_at.isoformat(),
            },
            "consent_records": [
                {
                    "consent_id": c.id,
                    "consent_version": c.consent_version,
                    "consent_text": c.consent_text,
                    "auth_source": c.auth_source,
                    "ip_hash": c.ip_hash,
                    "accepted_at": c.accepted_at.isoformat(),
                }
                for c in user.consents
            ],
            "conversations": [
                {
                    "conversation_id": conv.id,
                    "language": conv.language,
                    "status": conv.status,
                    "escalation_reason": conv.escalation_reason,
                    "created_at": conv.created_at.isoformat(),
                    "messages": [
                        {
                            "message_id": m.id,
                            "sender_type": m.sender_type,
                            "sender_name": m.sender_name,
                            "content": m.content,
                            "created_at": m.created_at.isoformat(),
                        }
                        for m in conv.messages
                    ],
                }
                for conv in user.conversations
            ],
        }
    )


@app.delete("/api/admin/gdpr/erase/{user_id}")
async def gdpr_erase_user_data(
    user_id: str, db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User ID not found.")

    await db.delete(user)
    db.add(
        AuditLog(
            actor="YUKIES Admin",
            action="gdpr_data_erased",
            target_user_id=user_id,
            details_json=json.dumps(
                {
                    "standard": "EU-GDPR Art. 17 / AT-DSG Right to Erasure",
                    "erased_at": datetime.now(timezone.utc).isoformat(),
                }
            ),
        )
    )
    await db.commit()
    return {
        "erased": True,
        "user_id": user_id,
        "message": "Alle personenbezogenen Daten und Chatverläufe dieser User-ID wurden gemäß DSGVO / österreichischem DSG vollständig gelöscht.",
    }


# ---------------------------------------------------------------------------
# WebSockets for Real-Time Customer Widget & Live Agent Panel
# ---------------------------------------------------------------------------


@app.websocket("/ws/chat/{conversation_id}")
async def websocket_customer_chat(websocket: WebSocket, conversation_id: str):
    await ws_manager.connect_conversation(conversation_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_conversation(conversation_id, websocket)


@app.websocket("/ws/admin")
async def websocket_admin_inbox(websocket: WebSocket):
    await ws_manager.connect_admin(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect_admin(websocket)


# ---------------------------------------------------------------------------
# Frontend Serving (Widget, Live Agent Admin Panel & Dawn 7.0 Storefront Demo)
# ---------------------------------------------------------------------------


@app.get("/widget/yukies-widget.js")
async def serve_widget_js():
    widget_path = settings.BASE_DIR / "frontend" / "widget" / "yukies-widget.js"
    return FileResponse(widget_path, media_type="application/javascript")


@app.get("/admin")
async def serve_admin_panel():
    admin_path = settings.BASE_DIR / "frontend" / "admin" / "index.html"
    return FileResponse(admin_path, media_type="text/html")


@app.get("/")
async def serve_demo_storefront():
    demo_path = settings.BASE_DIR / "frontend" / "demo-storefront.html"
    return FileResponse(demo_path, media_type="text/html")
