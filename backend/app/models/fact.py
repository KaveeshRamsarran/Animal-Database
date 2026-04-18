from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Fact(Base):
    __tablename__ = "facts"

    id = Column(Integer, primary_key=True)
    animal_id = Column(Integer, ForeignKey("animals.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    source = Column(String(255))

    animal = relationship("Animal", back_populates="facts")
