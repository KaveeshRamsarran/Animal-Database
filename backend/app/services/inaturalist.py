import httpx
from app.core.config import get_settings

settings = get_settings()
TIMEOUT = 15.0


async def search_taxa(query: str, limit: int = 10) -> list[dict]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(
                f"{settings.INATURALIST_API_URL}/taxa",
                params={"q": query, "per_page": limit, "rank": "species", "iconic_taxa": "Animalia"},
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for r in data.get("results", []):
                photo = r.get("default_photo") or {}
                results.append({
                    "inat_id": r.get("id"),
                    "common_name": r.get("preferred_common_name", ""),
                    "scientific_name": r.get("name"),
                    "photo_url": photo.get("medium_url"),
                    "wikipedia_url": r.get("wikipedia_url"),
                })
            return results
        except Exception:
            return []


async def get_observations(taxon_id: int, limit: int = 30) -> list[dict]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(
                f"{settings.INATURALIST_API_URL}/observations",
                params={"taxon_id": taxon_id, "per_page": limit, "quality_grade": "research", "geo": "true"},
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for r in data.get("results", []):
                loc = r.get("location")
                if loc:
                    parts = loc.split(",")
                    if len(parts) == 2:
                        results.append({
                            "latitude": float(parts[0]),
                            "longitude": float(parts[1]),
                            "source_name": "inaturalist",
                            "observed_at": r.get("observed_on"),
                        })
            return results
        except Exception:
            return []
