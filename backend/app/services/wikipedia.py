import httpx
from app.core.config import get_settings

settings = get_settings()
TIMEOUT = 15.0


async def get_summary(title: str) -> str | None:
    """Get Wikipedia summary for an animal."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(f"{settings.WIKIPEDIA_API_URL}/page/summary/{title}")
            if resp.status_code == 200:
                data = resp.json()
                return data.get("extract")
        except Exception:
            pass
    return None


async def get_image(title: str) -> str | None:
    """Get main image URL from Wikipedia."""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        try:
            resp = await client.get(f"{settings.WIKIPEDIA_API_URL}/page/summary/{title}")
            if resp.status_code == 200:
                data = resp.json()
                thumb = data.get("thumbnail") or {}
                return thumb.get("source")
        except Exception:
            pass
    return None
