from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from backend.config.settings import settings
from backend.database.models import Base

engine = create_engine(
    settings.database.url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database.url else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

# Ensure tables are created
init_db()

def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
