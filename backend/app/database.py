from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,       # Checks connection health before using from pool
    pool_size=10 if not settings.DATABASE_URL.startswith("sqlite") else 5,
    max_overflow=20 if not settings.DATABASE_URL.startswith("sqlite") else 10,
    echo=settings.ENVIRONMENT == "development",
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
