"""Fix hero_image_url for ALL animals: convert original URLs to proper thumbnails,
and sync Image table entries to use working hero URLs."""
import asyncio
import re
from app.db.base_all import Base
from app.models.animal import Animal
from app.models.image import Image
from app.models.continent import Continent
from app.models.conservation import ConservationStatus
from app.models.behavior import Behavior
from app.models.country import Country
from app.models.occurrence import Occurrence
from app.models.fact import Fact
from app.models.user import User
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select
from app.core.config import get_settings

STANDARD_STEPS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840]
THUMB_RE = re.compile(r'/(\d+)px-')


def make_thumb(original_url: str, width: int) -> str:
    """Create a standard-step thumbnail URL from an original Wikimedia Commons URL."""
    if not original_url:
        return original_url

    # Pick nearest standard step >= width
    step = STANDARD_STEPS[-1]
    for s in STANDARD_STEPS:
        if s >= width:
            step = s
            break

    # If already a thumbnail URL, just fix the size
    if '/thumb/' in original_url:
        m = THUMB_RE.search(original_url)
        if m:
            return original_url[:m.start(1)] + str(step) + original_url[m.end(1):]
        return original_url

    # Convert original URL to thumbnail
    # e.g. .../commons/a/ab/File.jpg -> .../commons/thumb/a/ab/File.jpg/960px-File.jpg
    commons_idx = original_url.find('/wikipedia/commons/')
    if commons_idx == -1:
        return original_url

    base = original_url[:commons_idx] + '/wikipedia/commons/thumb/'
    rest = original_url[commons_idx + len('/wikipedia/commons/'):]
    filename = original_url.split('/')[-1]
    return f"{base}{rest}/{step}px-{filename}"


async def fix():
    engine = create_async_engine(get_settings().DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        result = await db.execute(select(Animal))
        animals = result.scalars().all()

        hero_fixed = 0
        thumb_fixed = 0
        img_fixed = 0

        for a in animals:
            # Fix hero_image_url: convert to 960px thumbnail
            if a.hero_image_url and '/thumb/' not in a.hero_image_url:
                new_hero = make_thumb(a.hero_image_url, 960)
                if new_hero != a.hero_image_url:
                    a.hero_image_url = new_hero
                    hero_fixed += 1

            # Fix thumbnail_url: ensure 330px standard step
            if a.thumbnail_url and '/thumb/' not in a.thumbnail_url:
                new_thumb = make_thumb(a.thumbnail_url, 330)
                if new_thumb != a.thumbnail_url:
                    a.thumbnail_url = new_thumb
                    thumb_fixed += 1

            # Also fix non-standard sizes in existing thumb URLs
            if a.hero_image_url and '/thumb/' in a.hero_image_url:
                m = THUMB_RE.search(a.hero_image_url)
                if m and int(m.group(1)) not in STANDARD_STEPS:
                    a.hero_image_url = make_thumb(a.hero_image_url, 960)
                    hero_fixed += 1

            if a.thumbnail_url and '/thumb/' in a.thumbnail_url:
                m = THUMB_RE.search(a.thumbnail_url)
                if m and int(m.group(1)) not in STANDARD_STEPS:
                    a.thumbnail_url = make_thumb(a.thumbnail_url, 330)
                    thumb_fixed += 1

            # Sync Image table: update each Image entry to use the animal's hero URL
            img_result = await db.execute(
                select(Image).where(Image.animal_id == a.id)
            )
            images = img_result.scalars().all()
            for img in images:
                # If the Image URL is different from the hero (stale), update it
                hero_960 = a.hero_image_url
                if img.url != hero_960 and hero_960:
                    img.url = hero_960
                    img_fixed += 1

        await db.commit()

    await engine.dispose()
    print(f"Fixed {hero_fixed} hero URLs (converted to /thumb/ 960px)")
    print(f"Fixed {thumb_fixed} thumbnail URLs")
    print(f"Synced {img_fixed} Image table entries to match hero URLs")

asyncio.run(fix())
