from pydantic import BaseModel
from datetime import datetime


class ConservationStatusOut(BaseModel):
    id: int
    code: str
    name: str
    description: str | None = None
    severity: int = 0

    class Config:
        from_attributes = True


class ImageOut(BaseModel):
    id: int
    url: str
    alt_text: str | None = None
    source: str | None = None
    is_hero: bool = False

    class Config:
        from_attributes = True


class FactOut(BaseModel):
    id: int
    content: str
    source: str | None = None

    class Config:
        from_attributes = True


class BehaviorDetail(BaseModel):
    category: str
    label: str
    detail: str | None = None

    class Config:
        from_attributes = True


class AnimalCard(BaseModel):
    id: int
    slug: str
    common_name: str
    scientific_name: str | None = None
    class_name: str | None = None
    thumbnail_url: str | None = None
    hero_image_url: str | None = None
    conservation_status: ConservationStatusOut | None = None
    diet: str | None = None
    habitat_summary: str | None = None
    environment_type: str | None = None
    biome: str | None = None
    observation_count: int = 0

    class Config:
        from_attributes = True


class ContinentOut(BaseModel):
    id: int
    name: str
    code: str
    description: str | None = None
    image_url: str | None = None

    class Config:
        from_attributes = True


class CountryBrief(BaseModel):
    id: int
    name: str
    code: str

    class Config:
        from_attributes = True


class AnimalDetail(BaseModel):
    id: int
    slug: str
    common_name: str
    scientific_name: str | None = None
    alternate_names: str | None = None
    kingdom: str | None = None
    phylum: str | None = None
    class_name: str | None = None
    order_name: str | None = None
    family_name: str | None = None
    genus: str | None = None
    species: str | None = None
    description: str | None = None
    diet: str | None = None
    diet_detail: str | None = None
    lifespan: str | None = None
    average_weight: str | None = None
    average_length: str | None = None
    habitat_summary: str | None = None
    behavior_summary: str | None = None
    reproduction: str | None = None
    predators: str | None = None
    prey: str | None = None
    social_structure: str | None = None
    activity_period: str | None = None
    migration_behavior: str | None = None
    communication: str | None = None
    ecological_role: str | None = None
    fun_facts: str | None = None
    wiki_summary: str | None = None
    hero_image_url: str | None = None
    thumbnail_url: str | None = None
    environment_type: str | None = None
    is_domesticated: bool = False
    observation_count: int = 0
    biome: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    conservation_status: ConservationStatusOut | None = None
    continent: ContinentOut | None = None
    countries: list[CountryBrief] = []
    images: list[ImageOut] = []
    facts: list[FactOut] = []
    behaviors: list[BehaviorDetail] = []

    class Config:
        from_attributes = True


class AnimalCompare(BaseModel):
    id: int
    slug: str
    common_name: str
    scientific_name: str | None = None
    class_name: str | None = None
    order_name: str | None = None
    family_name: str | None = None
    diet: str | None = None
    lifespan: str | None = None
    average_weight: str | None = None
    average_length: str | None = None
    habitat_summary: str | None = None
    behavior_summary: str | None = None
    conservation_status: ConservationStatusOut | None = None
    hero_image_url: str | None = None
    environment_type: str | None = None
    countries: list[CountryBrief] = []
    behaviors: list[BehaviorDetail] = []

    class Config:
        from_attributes = True
