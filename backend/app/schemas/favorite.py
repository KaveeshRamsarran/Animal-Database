from pydantic import BaseModel
from datetime import datetime


class FavoriteOut(BaseModel):
    id: int
    animal_id: int
    animal_slug: str | None = None
    animal_name: str | None = None
    animal_thumbnail: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True


class FavoriteCreate(BaseModel):
    animal_id: int
