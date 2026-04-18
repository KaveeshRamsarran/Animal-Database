import asyncio
from app.db.session import engine
from app.db.base import Base
# Import all models to register them with Base
from app.models import animal, country, occurrence, conservation, behavior, continent, image, user, favorite, habitat, fact, sync_job, api_source

async def reset():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("DB reset complete")

asyncio.run(reset())
