from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Occurrence(Base):
    __tablename__ = "occurrences"

    id = Column(Integer, primary_key=True)
    animal_id = Column(Integer, ForeignKey("animals.id", ondelete="CASCADE"), nullable=False, index=True)
    source_name = Column(String(50))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    country_code = Column(String(3))
    region_name = Column(String(255))
    biome = Column(String(100))
    observation_count = Column(Integer, default=1)
    observed_at = Column(DateTime(timezone=True))
    raw_payload = Column(Text)

    animal = relationship("Animal", back_populates="occurrences")
