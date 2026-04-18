from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.occurrence import OccurrenceRepository
from app.schemas.map import HotspotOut, DistributionPoint

router = APIRouter()


@router.get("/hotspots", response_model=list[HotspotOut])
async def get_hotspots(
    limit: int = Query(500, ge=1, le=2000),
    continent: str | None = None,
    country: str | None = None,
    class_name: str | None = None,
    conservation_status: str | None = None,
    animal_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    repo = OccurrenceRepository(db)
    rows = await repo.get_hotspots(
        limit=limit, continent=continent, country=country,
        class_name=class_name, conservation_status=conservation_status,
        animal_id=animal_id,
    )
    return [HotspotOut(**r) for r in rows]


@router.get("/distribution/{animal_id}", response_model=list[DistributionPoint])
async def get_distribution(animal_id: int, db: AsyncSession = Depends(get_db)):
    repo = OccurrenceRepository(db)
    rows = await repo.get_distribution(animal_id)
    return [DistributionPoint(**r) for r in rows]
