"""Sync service to import data from external APIs into the database."""
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.animal import Animal
from app.models.occurrence import Occurrence
from app.models.sync_job import SyncJob
from app.models.image import Image
from app.services import gbif, inaturalist, wikipedia
from app.utils.slug import slugify

ANIMALS_TO_SYNC = [
    "African Elephant", "Bengal Tiger", "Blue Whale", "Red Fox", "Gray Wolf",
    "Bald Eagle", "Giant Panda", "Polar Bear", "Cheetah", "Gorilla",
    "Emperor Penguin", "Komodo Dragon", "Snow Leopard", "Bottlenose Dolphin",
    "Great White Shark", "Humpback Whale", "Orangutan", "Jaguar",
    "Red Kangaroo", "African Lion",
]


async def run_animal_sync(db: AsyncSession) -> SyncJob:
    job = SyncJob(job_type="animals", status="running")
    db.add(job)
    await db.flush()

    count = 0
    for name in ANIMALS_TO_SYNC:
        existing = await db.execute(select(Animal).where(Animal.slug == slugify(name)))
        if existing.scalar_one_or_none():
            continue

        gbif_results = await gbif.search_species(name, limit=1)
        inat_results = await inaturalist.search_taxa(name, limit=1)
        wiki_summary = await wikipedia.get_summary(name.replace(" ", "_"))
        wiki_image = await wikipedia.get_image(name.replace(" ", "_"))

        g = gbif_results[0] if gbif_results else {}
        i = inat_results[0] if inat_results else {}

        animal = Animal(
            slug=slugify(name),
            common_name=name,
            scientific_name=g.get("scientific_name") or i.get("scientific_name"),
            kingdom=g.get("kingdom", "Animalia"),
            phylum=g.get("phylum"),
            class_name=g.get("class_name"),
            order_name=g.get("order_name"),
            family_name=g.get("family_name"),
            genus=g.get("genus"),
            species=g.get("species"),
            wiki_summary=wiki_summary,
            hero_image_url=wiki_image or (i.get("photo_url")),
            thumbnail_url=i.get("photo_url") or wiki_image,
            gbif_id=g.get("gbif_id"),
            inat_id=i.get("inat_id"),
            popularity=100 - count,
        )
        db.add(animal)
        count += 1

    job.status = "completed"
    job.items_processed = count
    job.finished_at = datetime.now(timezone.utc)
    await db.flush()
    return job


async def run_occurrence_sync(db: AsyncSession) -> SyncJob:
    job = SyncJob(job_type="occurrences", status="running")
    db.add(job)
    await db.flush()

    animals = (await db.execute(select(Animal).where(Animal.gbif_id.isnot(None)))).scalars().all()
    count = 0
    for animal in animals:
        occ_data = await gbif.get_occurrences(animal.gbif_id, limit=20)
        for o in occ_data:
            occ = Occurrence(
                animal_id=animal.id,
                latitude=o["latitude"],
                longitude=o["longitude"],
                country_code=o.get("country_code"),
                source_name="gbif",
            )
            db.add(occ)
            count += 1
        animal.observation_count = (animal.observation_count or 0) + len(occ_data)

    job.status = "completed"
    job.items_processed = count
    job.finished_at = datetime.now(timezone.utc)
    await db.flush()
    return job


async def run_image_sync(db: AsyncSession) -> SyncJob:
    job = SyncJob(job_type="images", status="running")
    db.add(job)
    await db.flush()

    animals = (await db.execute(select(Animal))).scalars().all()
    count = 0
    for animal in animals:
        if animal.hero_image_url:
            existing = await db.execute(
                select(Image).where(Image.animal_id == animal.id, Image.is_hero == True)
            )
            if not existing.scalar_one_or_none():
                img = Image(animal_id=animal.id, url=animal.hero_image_url, is_hero=True, source="wikipedia")
                db.add(img)
                count += 1

    job.status = "completed"
    job.items_processed = count
    job.finished_at = datetime.now(timezone.utc)
    await db.flush()
    return job
