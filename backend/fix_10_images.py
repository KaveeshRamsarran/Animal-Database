"""Re-fetch images for 10 animals from Wikipedia API using correct article titles."""
import asyncio
import urllib.request
import urllib.parse
import json
import time
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
THUMB_PATTERN = re.compile(r'/(\d+)px-')

# Map animal common name -> Wikipedia article title
WIKI_TITLES = {
    "Bald Eagle": "Bald_eagle",
    "King Cobra": "King_cobra",
    "Kiwi": "Kiwi_(bird)",
    "Mandrill": "Mandrill",
    "Nile Crocodile": "Nile_crocodile",
    "Raccoon": "Raccoon",
    "Red Fox": "Red_fox",
    "Red Kangaroo": "Red_kangaroo",
    "Three-toed Sloth": "Three-toed_sloth",
    "Wandering Albatross": "Wandering_albatross",
}


def fix_thumb_size(url: str, target: int) -> str:
    """Ensure thumbnail URL uses a standard step size."""
    if not url:
        return url
    m = THUMB_PATTERN.search(url)
    if m:
        current = int(m.group(1))
        if current not in STANDARD_STEPS:
            for s in STANDARD_STEPS:
                if s >= target:
                    return url[:m.start(1)] + str(s) + url[m.end(1):]
    return url


def make_thumb(original_url: str, width: int) -> str:
    """Create a thumbnail URL from an original Wikimedia Commons URL."""
    # e.g. https://upload.wikimedia.org/wikipedia/commons/a/ab/File.jpg
    # ->   https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/File.jpg/960px-File.jpg
    if '/thumb/' in original_url:
        return fix_thumb_size(original_url, width)
    
    # Find the nearest standard step
    step = width
    for s in STANDARD_STEPS:
        if s >= width:
            step = s
            break

    # Extract filename from URL
    parts = original_url.split('/')
    filename = parts[-1]
    
    # Insert /thumb/ before the hash path and append /NNNpx-filename
    commons_idx = original_url.find('/wikipedia/commons/')
    if commons_idx == -1:
        return original_url
    
    base = original_url[:commons_idx] + '/wikipedia/commons/thumb/'
    rest = original_url[commons_idx + len('/wikipedia/commons/'):]
    return f"{base}{rest}/{step}px-{filename}"


def fetch_wikipedia_image(title: str) -> dict:
    """Fetch image URLs from Wikipedia API."""
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{urllib.parse.quote(title, safe='')}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "WildAtlas/1.0 (animal-database)"})
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read())
            
            result = {}
            if "originalimage" in data:
                orig = data["originalimage"]["source"]
                result["hero"] = make_thumb(orig, 960)
                result["thumb"] = make_thumb(orig, 330)
                result["original"] = orig
            elif "thumbnail" in data:
                thumb = data["thumbnail"]["source"]
                result["hero"] = fix_thumb_size(thumb, 960)
                result["thumb"] = fix_thumb_size(thumb, 330)
            return result
        except Exception as e:
            if "429" in str(e) and attempt < 2:
                print(f"  Rate limited, waiting...")
                time.sleep(5)
                continue
            print(f"  Failed to fetch {title}: {e}")
            return {}
    return {}


async def fix():
    engine = create_async_engine(get_settings().DATABASE_URL)
    Session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with Session() as db:
        for common_name, wiki_title in WIKI_TITLES.items():
            print(f"\n{common_name} (wiki: {wiki_title}):")
            
            imgs = fetch_wikipedia_image(wiki_title)
            if not imgs:
                print("  No image found!")
                continue
            
            hero = imgs.get("hero", "")
            thumb = imgs.get("thumb", "")
            print(f"  hero:  {hero[:120]}")
            print(f"  thumb: {thumb[:120]}")
            
            # Test if URL is accessible
            try:
                test_url = thumb or hero
                req = urllib.request.Request(test_url, method="HEAD", headers={"User-Agent": "WildAtlas/1.0"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    print(f"  Verified: HTTP {resp.status}")
            except Exception as e:
                print(f"  WARNING: URL test failed: {e}")
                # Try original instead
                if "original" in imgs:
                    print(f"  Trying original URL: {imgs['original'][:120]}")
                    hero = imgs["original"]
                    thumb = imgs["original"]
            
            # Update database
            r = await db.execute(select(Animal).where(Animal.common_name == common_name))
            animal = r.scalar_one_or_none()
            if animal:
                animal.hero_image_url = hero
                animal.thumbnail_url = thumb
                print(f"  Updated in DB!")
            
            time.sleep(1)  # Be nice to Wikipedia
        
        await db.commit()
        print("\n\nDone! All animals updated.")
    
    await engine.dispose()

asyncio.run(fix())
