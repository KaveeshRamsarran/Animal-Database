from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class Habitat(Base):
    __tablename__ = "habitats"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    biome = Column(String(100))

    animals = relationship("Animal", secondary="animal_habitats", back_populates="habitats")
