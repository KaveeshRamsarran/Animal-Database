from pydantic import BaseModel
from datetime import datetime


class SyncJobOut(BaseModel):
    id: int
    job_type: str
    status: str
    result_message: str | None = None
    items_processed: int = 0
    started_at: datetime | None = None
    finished_at: datetime | None = None

    class Config:
        from_attributes = True


class SyncRequest(BaseModel):
    job_type: str  # animals, occurrences, images, all


class StatsOut(BaseModel):
    total_animals: int = 0
    total_countries: int = 0
    total_occurrences: int = 0
    total_images: int = 0
    total_users: int = 0
    last_sync: datetime | None = None
