from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.db.session import get_db
from app.models.animal import Animal
from app.models.country import Country
from app.models.occurrence import Occurrence
from app.models.image import Image
from app.models.user import User
from app.models.sync_job import SyncJob
from app.models.conservation import ConservationStatus
from app.schemas.admin import StatsOut

router = APIRouter()


@router.get("", response_model=StatsOut)
async def get_stats(db: AsyncSession = Depends(get_db)):
    animals = (await db.execute(select(func.count(Animal.id)))).scalar() or 0
    countries = (await db.execute(select(func.count(Country.id)))).scalar() or 0
    occurrences = (await db.execute(select(func.count(Occurrence.id)))).scalar() or 0
    images = (await db.execute(select(func.count(Image.id)))).scalar() or 0
    users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    last_sync_result = await db.execute(select(SyncJob.finished_at).order_by(desc(SyncJob.finished_at)).limit(1))
    last_sync = last_sync_result.scalar_one_or_none()
    return StatsOut(
        total_animals=animals, total_countries=countries,
        total_occurrences=occurrences, total_images=images,
        total_users=users, last_sync=last_sync,
    )


@router.get("/conservation-statuses", response_model=list[dict])
async def list_conservation_statuses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ConservationStatus).order_by(ConservationStatus.severity.desc()))
    return [{"id": c.id, "code": c.code, "name": c.name, "severity": c.severity} for c in result.scalars().all()]
