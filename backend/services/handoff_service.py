from datetime import datetime, timezone
from email.message import EmailMessage
import json
import smtplib
from fastapi import WebSocket

from backend.config import settings


class RealtimeConnectionManager:
    """Manages real-time WebSocket connections for customer widgets and the Live Agent Inbox."""

    def __init__(self) -> None:
        self.conversation_sockets: dict[str, list[WebSocket]] = {}
        self.admin_sockets: list[WebSocket] = []

    async def connect_conversation(
        self, conversation_id: str, websocket: WebSocket
    ) -> None:
        await websocket.accept()
        self.conversation_sockets.setdefault(conversation_id, []).append(websocket)

    def disconnect_conversation(
        self, conversation_id: str, websocket: WebSocket
    ) -> None:
        conns = self.conversation_sockets.get(conversation_id, [])
        if websocket in conns:
            conns.remove(websocket)

    async def connect_admin(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.admin_sockets.append(websocket)

    def disconnect_admin(self, websocket: WebSocket) -> None:
        if websocket in self.admin_sockets:
            self.admin_sockets.remove(websocket)

    async def broadcast_to_conversation(
        self, conversation_id: str, payload: dict
    ) -> None:
        dead: list[WebSocket] = []
        for ws in self.conversation_sockets.get(conversation_id, []):
            try:
                await ws.send_text(json.dumps(payload, default=str))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_conversation(conversation_id, ws)

    async def broadcast_to_admins(self, payload: dict) -> None:
        dead: list[WebSocket] = []
        for ws in self.admin_sockets:
            try:
                await ws.send_text(json.dumps(payload, default=str))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect_admin(ws)


ws_manager = RealtimeConnectionManager()


class HandoffNotificationService:
    """Dispatches structured escalation notifications to Silvia Ragucci & Barbara Bischof-Fünfrock."""

    def __init__(self) -> None:
        self.outbox_log: list[dict] = []

    async def send_escalation_email(
        self,
        *,
        conversation_id: str,
        user_id: str,
        customer_name: str,
        customer_email: str | None,
        language: str,
        reason: str,
        summary: str,
        transcript_lines: list[str],
    ) -> dict:
        recipients = [settings.SUPPORT_EMAIL_PRIMARY, settings.SUPPORT_EMAIL_SECONDARY]
        contact_label = customer_email or "keine E-Mail hinterlegt (Gast ohne E-Mail) – Rückmeldung nur über den Live-Chat möglich"
        subject = f"[YUKIES Chat-Übergabe] {customer_name} ({customer_email or 'ohne E-Mail'}) – {reason}"
        body = (
            f"Neue Kundenanfrage zur Übergabe an Silvia Ragucci & Barbara Bischof-Fünfrock\n"
            f"=========================================================================\n"
            f"Zeitpunkt (UTC): {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')}\n"
            f"Kundin / Kunde:  {customer_name}\n"
            f"E-Mail:          {contact_label}\n"
            f"User-ID (DSG):   {user_id}\n"
            f"Conversation-ID: {conversation_id}\n"
            f"Sprache:         {language.upper()}\n"
            f"Übergabegrund:   {reason}\n\n"
            f"Zusammenfassung:\n{summary}\n\n"
            f"Bisheriger Gesprächsverlauf:\n"
            + "\n".join(transcript_lines)
            + "\n\n---\nAntwortversprechen laut Service-Richtlinie: Innerhalb von 4 Stunden (8–18 Uhr, auch am Wochenende)."
        )

        record = {
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "to": recipients,
            "subject": subject,
            "body": body,
            "conversation_id": conversation_id,
            "user_id": user_id,
            "reason": reason,
            "delivery_mode": "sandbox_outbox",
        }

        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
            try:
                msg = EmailMessage()
                msg["Subject"] = subject
                msg["From"] = settings.SMTP_USER
                msg["To"] = ", ".join(recipients)
                msg.set_content(body)
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.send_message(msg)
                record["delivery_mode"] = "smtp_sent"
            except Exception as exc:
                record["delivery_mode"] = f"smtp_error_logged:{exc}"

        self.outbox_log.append(record)
        return record


handoff_notifier = HandoffNotificationService()
