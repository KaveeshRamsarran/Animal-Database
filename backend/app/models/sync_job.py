from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class SyncJob(Base):
    __tablename__ = "sync_jobs"

    id = Column(Integer, primary_key=True)
    job_type = Column(String(100), nullable=False)
    status = Column(String(50), default="pending")  # pending, running, completed, failed
    result_message = Column(Text)
    items_processed = Column(Integer, default=0)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    finished_at = Column(DateTime(timezone=True))
