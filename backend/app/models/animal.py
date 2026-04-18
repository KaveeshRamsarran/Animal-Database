from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey, DateTime, Index, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

# Association table for animal <-> country
from sqlalchemy import Table

animal_countries = Table(
    "animal_countries",
    Base.metadata,
    Column("animal_id", Integer, ForeignKey("animals.id", ondelete="CASCADE"), primary_key=True),
    Column("country_id", Integer, ForeignKey("countries.id", ondelete="CASCADE"), primary_key=True),
)

animal_habitats = Table(
    "animal_habitats",
    Base.metadata,
    Column("animal_id", Integer, ForeignKey("animals.id", ondelete="CASCADE"), primary_key=True),
    Column("habitat_id", Integer, ForeignKey("habitats.id", ondelete="CASCADE"), primary_key=True),
)


class Animal(Base):
    __tablename__ = "animals"
    __table_args__ = (
        Index("ix_animals_search", "common_name", "scientific_name"),
    )

    id = Column(Integer, primary_key=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    common_name = Column(String(255), nullable=False, index=True)
    scientific_name = Column(String(255), index=True)
    alternate_names = Column(Text)
    kingdom = Column(String(100), default="Animalia")
    phylum = Column(String(100))
    class_name = Column(String(100), index=True)
    order_name = Column(String(100))
    family_name = Column(String(100))
    genus = Column(String(100))
    species = Column(String(100))
    description = Column(Text)
    diet = Column(String(100))
    diet_detail = Column(Text)
    lifespan = Column(String(100))
    average_weight = Column(String(100))
    average_length = Column(String(100))
    conservation_status_id = Column(Integer, ForeignKey("conservation_statuses.id"))
    habitat_summary = Column(Text)
    behavior_summary = Column(Text)
    reproduction = Column(Text)
    predators = Column(Text)
    prey = Column(Text)
    social_structure = Column(String(255))
    activity_period = Column(String(100))  # diurnal, nocturnal, crepuscular
    migration_behavior = Column(Text)
    communication = Column(Text)
    ecological_role = Column(Text)
    fun_facts = Column(Text)
    wiki_summary = Column(Text)
    hero_image_url = Column(Text)
    thumbnail_url = Column(Text)
    gbif_id = Column(Integer, unique=True)
    inat_id = Column(Integer, unique=True)
    environment_type = Column(String(50))  # terrestrial, marine, freshwater, aerial
    is_domesticated = Column(Boolean, default=False)
    popularity = Column(Integer, default=0)
    observation_count = Column(Integer, default=0)
    continent_id = Column(Integer, ForeignKey("continents.id"))
    biome = Column(String(100))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    conservation_status = relationship("ConservationStatus", back_populates="animals")
    continent = relationship("Continent", back_populates="animals")
    countries = relationship("Country", secondary=animal_countries, back_populates="animals")
    habitats = relationship("Habitat", secondary=animal_habitats, back_populates="animals")
    occurrences = relationship("Occurrence", back_populates="animal", cascade="all, delete-orphan")
    images = relationship("Image", back_populates="animal", cascade="all, delete-orphan")
    facts = relationship("Fact", back_populates="animal", cascade="all, delete-orphan")
    animal_behaviors = relationship("AnimalBehavior", back_populates="animal", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="animal", cascade="all, delete-orphan")
