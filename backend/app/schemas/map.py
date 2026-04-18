from pydantic import BaseModel


class HotspotOut(BaseModel):
    id: int
    animal_id: int
    animal_name: str
    animal_slug: str
    thumbnail_url: str | None = None
    latitude: float
    longitude: float
    country_code: str | None = None
    observation_count: int = 1

    class Config:
        from_attributes = True


class DistributionPoint(BaseModel):
    latitude: float
    longitude: float
    observation_count: int = 1
    country_code: str | None = None
