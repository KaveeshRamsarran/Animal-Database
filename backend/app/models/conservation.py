from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class ConservationStatus(Base):
    __tablename__ = "conservation_statuses"

    id = Column(Integer, primary_key=True)
    code = Column(String(10), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    severity = Column(Integer, default=0)  # higher = more urgent

    animals = relationship("Animal", back_populates="conservation_status")
