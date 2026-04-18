from pydantic import BaseModel


class BehaviorOut(BaseModel):
    id: int
    category: str
    label: str
    description: str | None = None

    class Config:
        from_attributes = True
