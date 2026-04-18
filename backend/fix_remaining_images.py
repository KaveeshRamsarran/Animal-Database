"""Fix remaining animals with missing images using correct Wikipedia titles."""
import asyncio
import urllib.request
import urllib.parse
import json
import time
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
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

# Map common_name -> correct Wikipedia title
WIKI_FIXES = {
    "Barn Owl": "Barn_owl",
    "Fossa": "Fossa_(animal)",
    "Giant African Land Snail": "Lissachatina_fulica",
    "Giant Squid": "Giant_squid",
    "Japanese Spider Crab": "Japanese_spider_crab",
    "Red-eyed Tree Frog": "Agalychnis_callidryas",
}


def fetch_img(title):
    url = "https://en.wikipedia.org/api/rest_v1/page/summary/" + urllib.parse.quote(title, safe="")
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WildAtlas/1.0 (animal-database)"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read())
            result = {}
            if "originalimage" in data:
                result["hero"] = data["originalimage"]["source"]
            if "thumbnail" in data:
                result["thumb"] = data["thumbnail"]["source"]
            return result
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                time.sleep(3)
                continue
            print(f"  Failed {title}: {e}")
            return {}
    return {}


async def fix_remaining():
    engine = create_async_engine(settings.DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        result = await db.execute(
            select(Animal).where(Animal.hero_image_url == None).order_by(Animal.common_name)
        )
        animals = result.scalars().all()
        print(f"Still missing images: {len(animals)}")

        for animal in animals:
            wiki_title = WIKI_FIXES.get(animal.common_name, animal.common_name.replace(" ", "_"))
            print(f"  Trying {animal.common_name} -> {wiki_title}")
            data = fetch_img(wiki_title)
            if data.get("hero"):
                animal.hero_image_url = data["hero"]
                animal.thumbnail_url = data.get("thumb")
                from sqlalchemy import exists
                has_hero = await db.execute(
                    select(exists().where((Image.animal_id == animal.id) & (Image.is_hero == True)))
                )
                if not has_hero.scalar():
                    db.add(Image(animal_id=animal.id, url=data["hero"], is_hero=True, source="wikipedia"))
                print(f"    -> Got image!")
            else:
                print(f"    -> Still no image")
            time.sleep(1)

        await db.commit()

    await engine.dispose()
    print("Done!")


if __name__ == "__main__":
    asyncio.run(fix_remaining())
