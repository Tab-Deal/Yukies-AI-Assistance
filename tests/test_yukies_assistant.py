import pytest
from httpx import ASGITransport, AsyncClient

from backend.database import init_db
from backend.main import app
from backend.services.guardrails import analyze_customer_input, sanitize_ai_response


@pytest.fixture(autouse=True)
async def setup_database():
    await init_db()


@pytest.mark.asyncio
async def test_guardrails_zero_emoji_and_cosmetics_law():
    raw = (
        "Unsere Body Butter verhindert Schwangerschaftsstreifen 😊 und hält die Haut elastisch! "
        "Der Tummy Stick löst Krämpfe und Blähungen effektiv bei Drei-Monats-Koliken 🌿."
    )
    cleaned, fixes = sanitize_ai_response(raw)
    assert "😊" not in cleaned
    assert "🌿" not in cleaned
    assert "verhindert Schwangerschaftsstreifen" not in cleaned
    assert "pflegt die Haut, während sie sich dehnt" in cleaned
    assert "unterstützt die natürliche Elastizität der Haut" in cleaned
    assert "Drei-Monats-Koliken" not in cleaned
    assert len(fixes) >= 3


def test_pre_guardrail_offen_and_du_sie_detection():
    # Formal 'Sie' + [OFFEN] Body Butter frequency
    res_sie = analyze_customer_input(
        "Guten Tag, können Sie mir sagen, wie oft und wie viel Body Butter ich auftragen soll?"
    )
    assert res_sie.address_form == "Sie"
    assert res_sie.requires_immediate_handoff is True
    assert "[OFFEN]" in (res_sie.handoff_reason or "")

    # Broken Tummy Stick
    res_stick = analyze_customer_input("Der Stiel meines Tummy Sticks ist abgebrochen!")
    assert res_stick.requires_immediate_handoff is True
    assert res_stick.special_instruction == "tummy_stick_broken"


@pytest.mark.asyncio
async def test_guest_requires_gdpr_consent_and_creates_persistent_user_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Guest without consent must be rejected (Austrian DSG / GDPR)
        bad_res = await client.post(
            "/api/chat/session",
            json={
                "shopify_customer_id": None,
                "full_name": "Klara Gast",
                "email": "klara.gast@example.at",
                "gdpr_consent": False,
                "language": "de",
            },
        )
        assert bad_res.status_code == 400

        # 2. Guest with consent creates persistent user_id
        ok_res = await client.post(
            "/api/chat/session",
            json={
                "shopify_customer_id": None,
                "full_name": "Klara Gast",
                "email": "klara.gast@example.at",
                "gdpr_consent": True,
                "language": "de",
            },
        )
        assert ok_res.status_code == 200
        session_data = ok_res.json()
        assert session_data["user_id"]
        assert session_data["is_logged_in_shopify"] is False

        # 3. Ask about Sugar Scrub turning brown
        msg_res = await client.post(
            "/api/chat/message",
            json={
                "user_id": session_data["user_id"],
                "conversation_id": session_data["conversation_id"],
                "message": "Warum ist mein Sugar Scrub braun geworden?",
                "language": "de",
            },
        )
        assert msg_res.status_code == 200
        reply = msg_res.json()["reply_message"]
        assert "Rosenblüten" in reply["content"]
        assert any(
            p["handle"] == "yukies-sugarscrub" for p in reply["referenced_products"]
        )


@pytest.mark.asyncio
async def test_logged_in_shopify_customer_and_order_tracking_security():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Logged-in customer Anna Müller (#1042)
        anna_session = (
            await client.post(
                "/api/chat/session",
                json={
                    "shopify_customer_id": "cust_yukies_anna_101",
                    "full_name": "Anna Müller",
                    "email": "anna.mueller@example.at",
                    "gdpr_consent": True,
                    "language": "de",
                },
            )
        ).json()
        assert anna_session["is_logged_in_shopify"] is True

        # Anna checks her own order #1042 -> Allowed
        ord_res = await client.post(
            "/api/chat/message",
            json={
                "user_id": anna_session["user_id"],
                "conversation_id": anna_session["conversation_id"],
                "message": "Wo ist meine Bestellung #1042?",
                "language": "de",
            },
        )
        assert ord_res.status_code == 200
        reply_text = ord_res.json()["reply_message"]["content"]
        assert "#1042" in reply_text or "AT-POST-994821042" in reply_text or "Versendet" in reply_text

        # Anna tries to check Sophie's order #1048 -> Blocked by DSGVO check
        unauth_res = await client.post(
            "/api/chat/message",
            json={
                "user_id": anna_session["user_id"],
                "conversation_id": anna_session["conversation_id"],
                "message": "Wo ist meine Bestellung #1048?",
                "language": "de",
            },
        )
        assert unauth_res.status_code == 200
        unauth_text = unauth_res.json()["reply_message"]["content"]
        assert "Datenschutz" in unauth_text or "E-Mail-Adresse" in unauth_text or "nicht" in unauth_text.lower()


@pytest.mark.asyncio
async def test_live_agent_takeover_and_gdpr_export_erase():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        sess = (
            await client.post(
                "/api/chat/session",
                json={
                    "shopify_customer_id": None,
                    "full_name": "Lisa Test",
                    "email": "lisa.test@example.at",
                    "gdpr_consent": True,
                    "language": "de",
                },
            )
        ).json()
        conv_id = sess["conversation_id"]
        user_id = sess["user_id"]

        # Trigger handover via broken Tummy Stick
        esc = (
            await client.post(
                "/api/chat/message",
                json={
                    "user_id": user_id,
                    "conversation_id": conv_id,
                    "message": "Der Stiel meines Tummy Sticks ist abgebrochen.",
                    "language": "de",
                },
            )
        ).json()
        assert esc["handover_triggered"] is True
        assert esc["status"] == "waiting_for_agent"
        assert "office@bacciorganics.com" in esc["reply_message"]["content"]

        # Silvia Ragucci takes over the conversation live
        takeover = await client.post(
            f"/api/admin/conversations/{conv_id}/takeover",
            json={"agent_name": "Silvia Ragucci"},
        )
        assert takeover.status_code == 200
        assert takeover.json()["status"] == "agent_active"

        # Silvia sends a live message
        agent_msg = await client.post(
            f"/api/admin/conversations/{conv_id}/message",
            json={
                "agent_name": "Silvia Ragucci",
                "content": "Hallo Lisa, hier ist Silvia. Wir senden dir sofort Ersatz zu.",
            },
        )
        assert agent_msg.status_code == 200
        assert agent_msg.json()["message"]["sender_type"] == "human_agent"

        # GDPR Export (Art. 15)
        exp = await client.get(f"/api/admin/gdpr/export/{user_id}")
        assert exp.status_code == 200
        assert exp.json()["user_profile"]["user_id"] == user_id

        # GDPR Erase (Art. 17)
        erased = await client.delete(f"/api/admin/gdpr/erase/{user_id}")
        assert erased.status_code == 200
        assert erased.json()["erased"] is True
