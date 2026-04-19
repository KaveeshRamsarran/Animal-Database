from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.occurrence import Occurrence
from app.models.animal import Animal
from app.models.conservation import ConservationStatus


class OccurrenceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_hotspots(
        self,
        limit: int = 500,
        continent: str | None = None,
        country: str | None = None,
        class_name: str | None = None,
        conservation_status: str | None = None,
        animal_id: int | None = None,
    ) -> list[dict]:
        q = (
            select(
                Occurrence.id,
                Occurrence.animal_id,
                Animal.common_name.label("animal_name"),
                Animal.slug.label("animal_slug"),
                Animal.thumbnail_url,
                Occurrence.latitude,
                Occurrence.longitude,
                Occurrence.country_code,
                Occurrence.observation_count,
                ConservationStatus.code.label("conservation_status_code"),
            )
            .join(Animal, Occurrence.animal_id == Animal.id)
            .outerjoin(ConservationStatus, Animal.conservation_status_id == ConservationStatus.id)
        )
        if animal_id:
            q = q.where(Occurrence.animal_id == animal_id)
        if country:
            q = q.where(Occurrence.country_code == country.upper())
        if class_name:
            q = q.where(Animal.class_name == class_name)
        q = q.limit(limit)
        result = await self.db.execute(q)
        rows = result.all()
        return [dict(r._mapping) for r in rows]

    async def get_distribution(self, animal_id: int) -> list[dict]:
        q = select(
            Occurrence.latitude,
            Occurrence.longitude,
            Occurrence.observation_count,
            Occurrence.country_code,
        ).where(Occurrence.animal_id == animal_id)
        result = await self.db.execute(q)
        return [dict(r._mapping) for r in result.all()]
