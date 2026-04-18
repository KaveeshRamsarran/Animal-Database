from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Continent(Base):
    __tablename__ = "continents"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(2), unique=True, nullable=False)
    description = Column(Text)
    image_url = Column(Text)

    countries = relationship("Country", back_populates="continent")
    animals = relationship("Animal", back_populates="continent")
