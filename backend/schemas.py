from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


SupportedLanguage = Literal["de", "en", "fr", "it"]
AddressForm = Literal["du", "Sie"]
ConversationStatus = Literal[
    "ai_active", "waiting_for_agent", "agent_active", "resolved"
]


class ProductCardSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    handle: str
    title: str
    size: str
    price: str
    compare_at_price: str | None = None
    currency: str = "EUR"
    available: bool = True
    certification: str | None = None
    image_url: str | None = None
    product_url: str
    short_description: str


class SessionInitRequest(BaseModel):
    """Onboarding payload from the Shopify Dawn 7.0 widget."""

    shopify_customer_id: str | None = Field(
        default=None,
        description="Present automatically if customer is logged into yukies.at",
    )
    user_id: str | None = Field(
        default=None,
        description="Present when resuming a previously created guest session (guests no longer submit an email, so the locally cached user_id is the resume key).",
    )
    full_name: str = Field(..., min_length=1, max_length=200)
    email: str | None = Field(
        default=None,
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        description="Only present for logged-in Shopify customers. Guests no longer submit an email.",
    )
    gdpr_consent: bool = Field(
        default=True,
        description="Mandatory explicit acceptance of the Terms & Privacy Policy (incl. AI-in-training notice) before starting chat",
    )
    newsletter_consent: bool = Field(
        default=False,
        description="Optional explicit consent to receive newsletters, new products, and promotions via email",
    )
    consent_text: str = Field(
        default="Ich akzeptiere die Nutzungsbedingungen und die Datenschutzrichtlinie. Dieser Assistent befindet sich in der Trainingsphase: Antworten werden automatisch erzeugt, können Fehler enthalten und sind unverbindlich."
    )
    language: SupportedLanguage = "de"
    conversation_id: str | None = None


class MessageItemSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    conversation_id: str
    user_id: str
    sender_type: str
    sender_name: str
    content: str
    referenced_products: list[ProductCardSchema] = Field(default_factory=list)
    created_at: datetime


class SessionInitResponse(BaseModel):
    user_id: str
    conversation_id: str
    full_name: str
    email: str | None = None
    is_logged_in_shopify: bool
    newsletter_consent: bool = False
    language: SupportedLanguage
    address_form: AddressForm
    status: ConversationStatus
    assigned_agent: str | None = None
    welcome_message: str
    messages: list[MessageItemSchema] = Field(default_factory=list)


class ChatMessageRequest(BaseModel):
    user_id: str
    conversation_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    language: SupportedLanguage | None = None


class ChatMessageResponse(BaseModel):
    conversation_id: str
    user_id: str
    status: ConversationStatus
    assigned_agent: str | None = None
    language: SupportedLanguage
    address_form: AddressForm
    customer_message: MessageItemSchema
    reply_message: MessageItemSchema | None = None
    handover_triggered: bool = False
    handover_reason: str | None = None


class AgentTakeoverRequest(BaseModel):
    agent_name: str = Field(
        ..., description="Silvia Ragucci or Barbara Bischof-Fünfrock"
    )


class AgentMessageRequest(BaseModel):
    agent_name: str = Field(
        ..., description="Silvia Ragucci or Barbara Bischof-Fünfrock"
    )
    content: str = Field(..., min_length=1, max_length=4000)
