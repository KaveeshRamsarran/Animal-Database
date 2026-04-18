from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.db.session import get_db
from app.models.continent import Continent
from app.models.country import Country
from app.repositories.animal import AnimalRepository
from app.schemas.animal import AnimalCard, ContinentOut
from app.schemas.region import CountryOut
from app.schemas.common import PaginatedResponse
import math

router = APIRouter()


@router.get("/continents", response_model=list[ContinentOut])
async def list_continents(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Continent).order_by(Continent.name))
    return [ContinentOut.model_validate(c) for c in result.scalars().all()]


@router.get("/countries", response_model=list[CountryOut])
async def list_countries(
    continent: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Country).options(selectinload(Country.continent))
    if continent:
        q = q.join(Country.continent).where(Continent.name.ilike(continent))
    q = q.order_by(Country.name)
    result = await db.execute(q)
    items = []
    for c in result.scalars().all():
        out = CountryOut.model_validate(c)
        out.continent_name = c.continent.name if c.continent else None
        items.append(out)
    return items


@router.get("/countries/{code}", response_model=CountryOut)
async def get_country(code: str, db: AsyncSession = Depends(get_db)):
    from fastapi import HTTPException
    q = select(Country).options(selectinload(Country.continent)).where(Country.code == code.upper())
    result = await db.execute(q)
    country = result.scalar_one_or_none()
    if not country:
        raise HTTPException(status_code=404, detail="Country not found")
    out = CountryOut.model_validate(country)
    out.continent_name = country.continent.name if country.continent else None
    return out


@router.get("/countries/{code}/animals", response_model=PaginatedResponse[AnimalCard])
async def country_animals(
    code: str,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    repo = AnimalRepository(db)
    items, total = await repo.get_by_country(code, page=page, size=size)
    return PaginatedResponse(
        items=[AnimalCard.model_validate(a) for a in items],
        total=total, page=page, size=size, pages=math.ceil(total / size) if size else 0,
    )
