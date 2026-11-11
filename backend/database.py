from collections.abc import AsyncGenerator
from typing import Any
from sqlalchemy import create_engine
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


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    raw_session = SessionLocal()
    adapter = AsyncSession(raw_session)
    try:
        yield adapter
    finally:
        adapter.close()
