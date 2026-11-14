from collections.abc import AsyncGenerator
from typing import Any
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from backend.config import settings


class Base(DeclarativeBase):
    pass


def _normalize_sync_url(url: str) -> str:
    return url.replace("sqlite+aiosqlite://", "sqlite://").replace(
        "postgresql+asyncpg://", "postgresql://"
    )


engine = create_engine(
    _normalize_sync_url(settings.DATABASE_URL),
    connect_args=(
        {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
    ),
    echo=False,
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    class_=Session,
    expire_on_commit=False,
    autoflush=False,
)


class AsyncSession:
    """Async-compatible SQLAlchemy 2.0 session adapter (native Python 3.14 support without greenlet)."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def add(self, instance: Any) -> None:
        self._session.add(instance)

    async def execute(self, statement: Any, *args: Any, **kwargs: Any) -> Any:
        return self._session.execute(statement, *args, **kwargs)

    async def flush(self) -> None:
        self._session.flush()

    async def commit(self) -> None:
        self._session.commit()

    async def refresh(
        self, instance: Any, attribute_names: list[str] | None = None
    ) -> None:
        self._session.refresh(instance, attribute_names=attribute_names)

    async def delete(self, instance: Any) -> None:
        self._session.delete(instance)

    def close(self) -> None:
        self._session.close()


async def init_db() -> None:
    from backend import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        try:
            conn.execute(
                text(
                    "ALTER TABLE users ADD COLUMN newsletter_consent BOOLEAN DEFAULT 0"
                )
            )
            conn.commit()
        except Exception:
            pass
        try:
            conn.execute(
                text(
                    "ALTER TABLE consent_records ADD COLUMN newsletter_consent BOOLEAN DEFAULT 0"
                )
            )
            conn.commit()
        except Exception:
            pass
        # Ensure users.email is nullable for guest sessions in SQLite
        if "sqlite" in settings.DATABASE_URL:
            try:
                table_info = conn.execute(text("PRAGMA table_info(users)")).fetchall()
                email_cols = [col for col in table_info if col[1] == "email"]
                if email_cols and email_cols[0][3] == 1:
                    conn.execute(text("PRAGMA foreign_keys=off;"))
                    conn.execute(text("ALTER TABLE users RENAME TO _users_old;"))
                    conn.execute(
                        text(
                            """
                    CREATE TABLE users (
                        id VARCHAR(36) NOT NULL PRIMARY KEY, 
                        shopify_customer_id VARCHAR(128) UNIQUE, 
                        email VARCHAR(255), 
                        full_name VARCHAR(255) NOT NULL, 
                        preferred_language VARCHAR(8) NOT NULL, 
                        address_form VARCHAR(8) NOT NULL, 
                        is_logged_in_shopify BOOLEAN NOT NULL, 
                        created_at DATETIME NOT NULL, 
                        updated_at DATETIME NOT NULL, 
                        newsletter_consent BOOLEAN DEFAULT 0
                    );
                    """
                        )
                    )
                    conn.execute(
                        text(
                            """
                    INSERT INTO users (id, shopify_customer_id, email, full_name, preferred_language, address_form, is_logged_in_shopify, created_at, updated_at, newsletter_consent)
                    SELECT id, shopify_customer_id, email, full_name, preferred_language, address_form, is_logged_in_shopify, created_at, updated_at, newsletter_consent FROM _users_old;
                    """
                        )
                    )
                    conn.execute(text("DROP TABLE _users_old;"))
                    conn.execute(
                        text(
                            "CREATE UNIQUE INDEX IF NOT EXISTS ix_users_shopify_customer_id ON users (shopify_customer_id);"
                        )
                    )
                    conn.execute(
                        text(
                            "CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);"
                        )
                    )
                    conn.execute(text("PRAGMA foreign_keys=on;"))
                    conn.commit()
            except Exception:
                pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    raw_session = SessionLocal()
    adapter = AsyncSession(raw_session)
    try:
        yield adapter
    finally:
        adapter.close()
