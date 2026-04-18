from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.session import get_db
from app.models.behavior import Behavior
from app.schemas.behavior import BehaviorOut

router = APIRouter()


@router.get("", response_model=list[BehaviorOut])
async def list_behaviors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Behavior).order_by(Behavior.category))
    return [BehaviorOut.model_validate(b) for b in result.scalars().all()]
