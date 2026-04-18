from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from app.models.favorite import Favorite
from app.models.animal import Animal


class FavoriteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_user(self, user_id: int) -> list[Favorite]:
        q = (
            select(Favorite)
            .options(selectinload(Favorite.animal))
            .where(Favorite.user_id == user_id)
            .order_by(Favorite.created_at.desc())
        )
        result = await self.db.execute(q)
        return list(result.scalars().all())

    async def add(self, user_id: int, animal_id: int) -> Favorite:
        fav = Favorite(user_id=user_id, animal_id=animal_id)
        self.db.add(fav)
        await self.db.flush()
        return fav

    async def remove(self, user_id: int, animal_id: int) -> bool:
        q = delete(Favorite).where(Favorite.user_id == user_id, Favorite.animal_id == animal_id)
        result = await self.db.execute(q)
        return result.rowcount > 0
