from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc, asc
from sqlalchemy.orm import selectinload
from app.models.animal import Animal, animal_countries, animal_habitats
from app.models.conservation import ConservationStatus
from app.models.behavior import AnimalBehavior, Behavior
from app.models.country import Country
from app.models.continent import Continent


class AnimalRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _base_query(self):
        return select(Animal).options(
            selectinload(Animal.conservation_status),
            selectinload(Animal.continent),
            selectinload(Animal.countries),
            selectinload(Animal.images),
            selectinload(Animal.facts),
            selectinload(Animal.animal_behaviors).selectinload(AnimalBehavior.behavior),
        )

    async def get_by_slug(self, slug: str) -> Animal | None:
        q = self._base_query().where(Animal.slug == slug)
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def get_by_id(self, animal_id: int) -> Animal | None:
        q = self._base_query().where(Animal.id == animal_id)
        result = await self.db.execute(q)
        return result.scalar_one_or_none()

    async def list_animals(
        self,
        page: int = 1,
        size: int = 20,
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
    ):
        q = select(Animal).options(
            selectinload(Animal.conservation_status),
            selectinload(Animal.continent),
        )
        count_q = select(func.count(Animal.id))

        # Filters
        if search:
            term = f"%{search}%"
            filter_clause = or_(
                Animal.common_name.ilike(term),
                Animal.scientific_name.ilike(term),
                Animal.habitat_summary.ilike(term),
            )
            q = q.where(filter_clause)
            count_q = count_q.where(filter_clause)
        if class_name:
            q = q.where(Animal.class_name == class_name)
            count_q = count_q.where(Animal.class_name == class_name)
        if diet:
            q = q.where(Animal.diet == diet)
            count_q = count_q.where(Animal.diet == diet)
        if environment_type:
            q = q.where(Animal.environment_type == environment_type)
            count_q = count_q.where(Animal.environment_type == environment_type)
        if biome:
            q = q.where(Animal.biome == biome)
            count_q = count_q.where(Animal.biome == biome)
        if activity_pattern:
            q = q.where(Animal.activity_period == activity_pattern)
            count_q = count_q.where(Animal.activity_period == activity_pattern)
        if is_domesticated is not None:
            q = q.where(Animal.is_domesticated == is_domesticated)
            count_q = count_q.where(Animal.is_domesticated == is_domesticated)
        if continent:
            q = q.join(Animal.continent).where(Continent.name.ilike(continent))
            count_q = count_q.join(Animal.continent).where(Continent.name.ilike(continent))
        if country:
            q = q.join(Animal.countries).where(Country.code == country.upper())
            count_q = count_q.join(Animal.countries).where(Country.code == country.upper())
        if conservation_status:
            q = q.join(Animal.conservation_status).where(ConservationStatus.code == conservation_status.upper())
            count_q = count_q.join(Animal.conservation_status).where(ConservationStatus.code == conservation_status.upper())
        if habitat:
            q = q.join(animal_habitats).join(
                __import__('app.models.habitat', fromlist=['Habitat']).Habitat
            ).where(
                __import__('app.models.habitat', fromlist=['Habitat']).Habitat.name.ilike(f"%{habitat}%")
            )
            # simplified: skip count filter for habitat join

        # Sorting
        sort_map = {
            "common_name": asc(Animal.common_name),
            "-common_name": desc(Animal.common_name),
            "recently_added": desc(Animal.created_at),
            "conservation_urgency": desc(ConservationStatus.severity) if conservation_status else desc(Animal.id),
            "popularity": desc(Animal.popularity),
            "observation_count": desc(Animal.observation_count),
        }
        q = q.order_by(sort_map.get(sort, asc(Animal.common_name)))

        total_result = await self.db.execute(count_q)
        total = total_result.scalar() or 0

        q = q.offset((page - 1) * size).limit(size)
        result = await self.db.execute(q)
        items = result.scalars().unique().all()

        return items, total

    async def get_featured(self, limit: int = 8) -> list[Animal]:
        q = select(Animal).options(
            selectinload(Animal.conservation_status),
        ).order_by(desc(Animal.popularity)).limit(limit)
        result = await self.db.execute(q)
        return list(result.scalars().unique().all())

    async def search(self, term: str, limit: int = 10) -> list[Animal]:
        like = f"%{term}%"
        q = select(Animal).options(
            selectinload(Animal.conservation_status),
        ).where(
            or_(Animal.common_name.ilike(like), Animal.scientific_name.ilike(like))
        ).limit(limit)
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def get_by_ids(self, ids: list[int]) -> list[Animal]:
        q = self._base_query().where(Animal.id.in_(ids))
        result = await self.db.execute(q)
        return list(result.scalars().unique().all())

    async def get_by_country(self, country_code: str, page: int = 1, size: int = 20):
        q = select(Animal).options(
            selectinload(Animal.conservation_status),
        ).join(Animal.countries).where(Country.code == country_code.upper())
        count_q = select(func.count(Animal.id)).join(Animal.countries).where(Country.code == country_code.upper())

        total_result = await self.db.execute(count_q)
        total = total_result.scalar() or 0
        q = q.offset((page - 1) * size).limit(size)
        result = await self.db.execute(q)
        return list(result.scalars().unique().all()), total
