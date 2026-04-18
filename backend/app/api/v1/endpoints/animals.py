from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.repositories.animal import AnimalRepository
from app.schemas.animal import AnimalCard, AnimalDetail, AnimalCompare, BehaviorDetail
from app.schemas.common import PaginatedResponse
import math

router = APIRouter()


@router.get("", response_model=PaginatedResponse[AnimalCard])
async def list_animals(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    class_name: str | None = None,
    continent: str | None = None,
    country: str | None = None,
    diet: str | None = None,
    conservation_status: str | None = None,
    environment_type: str | None = None,
    biome: str | None = None,
    activity_pattern: str | None = None,
    is_domesticated: bool | None = None,
    habitat: str | None = None,
    sort: str = "common_name",
    db: AsyncSession = Depends(get_db),
):
    repo = AnimalRepository(db)
    items, total = await repo.list_animals(
        page=page, size=size, search=search, class_name=class_name,
        continent=continent, country=country, diet=diet,
        conservation_status=conservation_status, environment_type=environment_type,
        biome=biome, activity_pattern=activity_pattern,
        is_domesticated=is_domesticated, habitat=habitat, sort=sort,
    )
    return PaginatedResponse(
        items=[AnimalCard.model_validate(a) for a in items],
        total=total, page=page, size=size, pages=math.ceil(total / size) if size else 0,
    )


@router.get("/search", response_model=list[AnimalCard])
async def search_animals(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    repo = AnimalRepository(db)
    items = await repo.search(q, limit=limit)
    return [AnimalCard.model_validate(a) for a in items]


@router.get("/featured", response_model=list[AnimalCard])
async def featured_animals(
    limit: int = Query(8, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    repo = AnimalRepository(db)
    items = await repo.get_featured(limit=limit)
    return [AnimalCard.model_validate(a) for a in items]


@router.get("/compare", response_model=list[AnimalCompare])
async def compare_animals(
    ids: str = Query(..., description="Comma-separated animal IDs"),
    db: AsyncSession = Depends(get_db),
):
    id_list = [int(x.strip()) for x in ids.split(",") if x.strip().isdigit()][:3]
    repo = AnimalRepository(db)
    items = await repo.get_by_ids(id_list)
    results = []
    for a in items:
        behaviors = [
            BehaviorDetail(category=ab.behavior.category, label=ab.behavior.label, detail=ab.detail)
            for ab in a.animal_behaviors
        ]
        data = AnimalCompare.model_validate(a)
        data.behaviors = behaviors
        results.append(data)
    return results


@router.get("/{slug}", response_model=AnimalDetail)
async def get_animal(slug: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    repo = AnimalRepository(db)
    animal = await repo.get_by_slug(slug)
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    behaviors = [
        BehaviorDetail(category=ab.behavior.category, label=ab.behavior.label, detail=ab.detail)
        for ab in animal.animal_behaviors
    ]
    result = AnimalDetail.model_validate(animal)
    result.behaviors = behaviors
    return result
