from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Project paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    KNOWLEDGE_BASE_DIR: Path = BASE_DIR / "knowledge_base"

    # Google Gemini Cloud API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3-flash-preview"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"
    GCP_PROJECT_ID: str = "yukies-ai-assistance"
    GCP_LOCATION: str = "europe-west3"

    # Database & GDPR Retention (6 Months = 180 Days per Austrian DSG / EU GDPR)
    DATABASE_URL: str = "sqlite+aiosqlite:///./yukies_assistant.db"
    DATA_RETENTION_DAYS: int = 180
    CONSENT_VERSION: str = "v1.2-AT-DSG-6M-2026-11"

    # YUKIES Shopify Storefront (Dawn 7.0)
    STORE_NAME: str = "YUKIES"
    STORE_DOMAIN: str = "yukies.at"
    SHOPIFY_MODE: str = "sandbox"  # "sandbox" (safe isolated + public JSON) or "live"
    SHOPIFY_STOREFRONT_TOKEN: str = ""
    SHOPIFY_ADMIN_TOKEN: str = ""
    SHOPIFY_API_VERSION: str = "2026-10"

    # Human Handoff & Escalation (Silvia Ragucci & Barbara Bischof-Fünfrock)
    SUPPORT_EMAIL_PRIMARY: str = "office@bacciorganics.com"
    SUPPORT_EMAIL_SECONDARY: str = "office@yukies.at"
    SUPPORT_AGENTS: str = "Silvia Ragucci,Barbara Bischof-Fünfrock"
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # Admin Security
    ADMIN_USERNAME: str = "yukies"
    ADMIN_PASSWORD: str = "yukies-wien-2026"
    ADMIN_API_KEY: str = "yukies-admin-secret-2026"

    @property
    def support_agents_list(self) -> list[str]:
        return [a.strip() for a in self.SUPPORT_AGENTS.split(",") if a.strip()]


settings = Settings()
