from pydantic import BaseModel
from datetime import datetime


class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_admin: bool
    created_at: datetime | None = None

    class Config:
        from_attributes = True
