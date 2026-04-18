import httpx
from app.core.config import get_settings

settings = get_settings()
TIMEOUT = 15.0


async def search_species(query: str, limit: int = 20) -> list[dict]:
    """Search GBIF for species matching query."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(
                f"{settings.GBIF_API_URL}/species/search",
                params={"q": query, "limit": limit, "rank": "SPECIES", "kingdom": "Animalia"},
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for r in data.get("results", []):
                results.append({
                    "gbif_id": r.get("key"),
                    "scientific_name": r.get("scientificName"),
                    "common_name": r.get("vernacularName", r.get("canonicalName", "")),
                    "kingdom": r.get("kingdom"),
                    "phylum": r.get("phylum"),
                    "class_name": r.get("class"),
                    "order_name": r.get("order"),
                    "family_name": r.get("family"),
                    "genus": r.get("genus"),
                    "species": r.get("species"),
                })
            return results
        except Exception:
            return []


async def get_occurrences(gbif_id: int, limit: int = 50) -> list[dict]:
    """Fetch occurrence records for a species from GBIF."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(
                f"{settings.GBIF_API_URL}/occurrence/search",
                params={"taxonKey": gbif_id, "limit": limit, "hasCoordinate": "true"},
            )
            resp.raise_for_status()
            data = resp.json()
            results = []
            for r in data.get("results", []):
                lat = r.get("decimalLatitude")
                lon = r.get("decimalLongitude")
                if lat and lon:
                    results.append({
                        "latitude": lat,
                        "longitude": lon,
                        "country_code": r.get("countryCode"),
                        "source_name": "gbif",
                        "observed_at": r.get("eventDate"),
                    })
            return results
        except Exception:
            return []
