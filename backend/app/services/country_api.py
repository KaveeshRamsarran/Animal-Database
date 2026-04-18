import httpx
from app.core.config import get_settings

settings = get_settings()
TIMEOUT = 15.0


async def get_all_countries() -> list[dict]:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(f"{settings.REST_COUNTRIES_URL}/all", params={"fields": "name,cca2,capital,region,subregion,population,area,flags"})
            resp.raise_for_status()
            results = []
            for c in resp.json():
                name_obj = c.get("name", {})
                flags = c.get("flags", {})
                capitals = c.get("capital", [])
                results.append({
                    "name": name_obj.get("common", ""),
                    "code": c.get("cca2", ""),
                    "capital": capitals[0] if capitals else None,
                    "region": c.get("region"),
                    "subregion": c.get("subregion"),
                    "population": c.get("population"),
                    "area": c.get("area"),
                    "flag_url": flags.get("svg") or flags.get("png"),
                })
            return results
        except Exception:
            return []
