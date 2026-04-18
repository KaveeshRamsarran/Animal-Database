from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Behavior(Base):
    __tablename__ = "behaviors"

    id = Column(Integer, primary_key=True)
    category = Column(String(100), nullable=False, unique=True)  # e.g. social, hunting, mating
    label = Column(String(255), nullable=False)
    description = Column(Text)

    animal_behaviors = relationship("AnimalBehavior", back_populates="behavior")


class AnimalBehavior(Base):
    __tablename__ = "animal_behaviors"

    id = Column(Integer, primary_key=True)
    animal_id = Column(Integer, ForeignKey("animals.id", ondelete="CASCADE"), nullable=False)
    behavior_id = Column(Integer, ForeignKey("behaviors.id", ondelete="CASCADE"), nullable=False)
    detail = Column(Text)

    animal = relationship("Animal", back_populates="animal_behaviors")
    behavior = relationship("Behavior", back_populates="animal_behaviors")
