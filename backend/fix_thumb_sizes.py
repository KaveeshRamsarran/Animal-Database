"""Fix all Wikimedia thumbnail URLs to use standard step sizes.

Wikimedia now enforces standard thumbnail steps: 20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840.
Non-standard sizes like 800px, 320px return HTTP 429 errors.
"""
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

# Pattern: /NNNpx- in thumbnail URLs
THUMB_PATTERN = re.compile(r'/(\d+)px-')


def nearest_step(width: int) -> int:
    """Find the smallest standard step >= the requested width."""
    for s in STANDARD_STEPS:
        if s >= width:
            return s
    return STANDARD_STEPS[-1]


def fix_url(url: str, target_step: int | None = None) -> str:
    """Replace non-standard thumbnail width with nearest standard step."""
    if not url or 'upload.wikimedia.org' not in url:
        return url

    m = THUMB_PATTERN.search(url)
    if not m:
        return url

    current = int(m.group(1))
    if current in STANDARD_STEPS:
        return url  # Already valid

    step = target_step or nearest_step(current)
    return url[:m.start(1)] + str(step) + url[m.end(1):]


async def fix():
    engine = create_async_engine(get_settings().DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        # Fix Animal hero_image_url and thumbnail_url
        r = await db.execute(select(Animal))
        animals = r.scalars().all()

        hero_fixed = 0
        thumb_fixed = 0
        for a in animals:
            if a.hero_image_url and 'upload.wikimedia.org' in a.hero_image_url:
                new_hero = fix_url(a.hero_image_url, 960)
                if new_hero != a.hero_image_url:
                    a.hero_image_url = new_hero
                    hero_fixed += 1

            if a.thumbnail_url and 'upload.wikimedia.org' in a.thumbnail_url:
                new_thumb = fix_url(a.thumbnail_url, 330)
                if new_thumb != a.thumbnail_url:
                    a.thumbnail_url = new_thumb
                    thumb_fixed += 1

        # Fix Image table URLs too
        r2 = await db.execute(select(Image))
        images = r2.scalars().all()
        img_fixed = 0
        for img in images:
            if img.url and 'upload.wikimedia.org' in img.url:
                new_url = fix_url(img.url, 960)
                if new_url != img.url:
                    img.url = new_url
                    img_fixed += 1

        await db.commit()
        print(f"Fixed {hero_fixed} hero URLs")
        print(f"Fixed {thumb_fixed} thumbnail URLs")
        print(f"Fixed {img_fixed} Image table URLs")

        # Verify a sample
        print("\nSample URLs after fix:")
        r3 = await db.execute(select(Animal.common_name, Animal.hero_image_url, Animal.thumbnail_url).limit(5))
        for name, hero, thumb in r3.all():
            print(f"  {name}:")
            print(f"    hero:  {hero[:120] if hero else 'NONE'}")
            print(f"    thumb: {thumb[:120] if thumb else 'NONE'}")

    await engine.dispose()

asyncio.run(fix())
