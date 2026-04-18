from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True)
    animal_id = Column(Integer, ForeignKey("animals.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    alt_text = Column(String(500))
    source = Column(String(100))
    is_hero = Column(Boolean, default=False)

    animal = relationship("Animal", back_populates="images")
