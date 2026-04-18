import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.config import get_settings
from app.db.base_all import Base
from app.models.animal import Animal

async def check():
    s = get_settings()
    engine = create_async_engine(s.DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession)
    async with Session() as db:
        r = await db.execute(select(Animal).where(Animal.slug == "african-elephant"))
        a = r.scalar_one()
        print(f"Name: {a.common_name}")
        print(f"Desc length: {len(a.description or '')}")
        print(f"Wiki length: {len(a.wiki_summary or '')}")
        print(f"Fun facts length: {len(a.fun_facts or '')}")
        print(f"Ecological role present: {bool(a.ecological_role)}")
        print(f"Communication present: {bool(a.communication)}")
        print(f"Diet detail present: {bool(a.diet_detail)}")
        r2 = await db.execute(select(Animal))
        all_animals = r2.scalars().all()
        print(f"Total animals: {len(all_animals)}")
        enhanced_count = sum(1 for a in all_animals if a.ecological_role)
        print(f"Animals with ecological_role: {enhanced_count}")
    await engine.dispose()

asyncio.run(check())
