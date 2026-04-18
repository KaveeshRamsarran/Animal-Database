"""Fix Barn Owl image."""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select, func
from app.db.base_all import Base
from app.core.config import get_settings
from app.models.animal import Animal
from app.models.image import Image
from app.models.continent import Continent
from app.models.conservation import ConservationStatus
from app.models.behavior import Behavior
from app.models.country import Country
from app.models.occurrence import Occurrence
from app.models.fact import Fact
from app.models.user import User

settings = get_settings()

async def fix():
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with Session() as db:
        r = await db.execute(select(Animal).where(Animal.common_name == "Barn Owl"))
        a = r.scalar_one_or_none()
        if a and not a.hero_image_url:
            a.hero_image_url = "https://upload.wikimedia.org/wikipedia/commons/1/17/Barn_Owl%2C_Lancashire.jpg"
            a.thumbnail_url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Barn_Owl%2C_Lancashire.jpg/320px-Barn_Owl%2C_Lancashire.jpg"
            from sqlalchemy import exists
            has_hero = await db.execute(select(exists().where((Image.animal_id == a.id) & (Image.is_hero == True))))
            if not has_hero.scalar():
                db.add(Image(animal_id=a.id, url=a.hero_image_url, is_hero=True, source="wikipedia"))
            print("Barn Owl image fixed!")

        # Final stats
        r2 = await db.execute(select(func.count()).where(Animal.hero_image_url == None))
        print(f"Still missing images: {r2.scalar()}")
        r3 = await db.execute(select(func.count()).where((Animal.predators == None) | (Animal.predators == "")))
        print(f"Missing predators: {r3.scalar()}")
        r4 = await db.execute(select(func.count()).where((Animal.prey == None) | (Animal.prey == "")))
        print(f"Missing prey: {r4.scalar()}")
        r5 = await db.execute(select(func.count()).where((Animal.diet_detail == None) | (Animal.diet_detail == "")))
        print(f"Missing diet_detail: {r5.scalar()}")
        r6 = await db.execute(select(func.count()).select_from(Animal))
        print(f"Total animals: {r6.scalar()}")

        await db.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(fix())
