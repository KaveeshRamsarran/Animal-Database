from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    code = Column(String(3), unique=True, nullable=False, index=True)
    continent_id = Column(Integer, ForeignKey("continents.id"))
    capital = Column(String(255))
    region = Column(String(100))
    subregion = Column(String(100))
    population = Column(Integer)
    area = Column(Integer)
    flag_url = Column(Text)
    wildlife_overview = Column(Text)

    continent = relationship("Continent", back_populates="countries")
    animals = relationship("Animal", secondary="animal_countries", back_populates="countries")
