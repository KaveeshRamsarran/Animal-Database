import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.config import get_settings
from app.db.base_all import Base
from app.models.animal import Animal

async def main():
    s = get_settings()
    engine = create_async_engine(s.DATABASE_URL)
    S = async_sessionmaker(engine, class_=AsyncSession)
    async with S() as db:
        r = await db.execute(select(Animal.slug, Animal.common_name, Animal.biome, Animal.class_name).order_by(Animal.common_name))
        for slug, name, biome, cls in r.all():
            print(f"{slug}|{name}|{biome or 'None'}|{cls or 'None'}")
    await engine.dispose()

asyncio.run(main())
