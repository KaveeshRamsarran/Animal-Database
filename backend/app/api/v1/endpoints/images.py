"""Image proxy for Wikimedia images to avoid browser UA/extension blocking."""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from urllib.parse import urlparse
import httpx

router = APIRouter()

ALLOWED_DOMAINS = {"upload.wikimedia.org", "commons.wikimedia.org"}

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            follow_redirects=True,
            timeout=15,
            headers={
                "User-Agent": "WildAtlas/1.0 (https://wildatlas.app; educational wildlife database)",
                "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
            },
        )
    return _client


@router.get("/proxy")
async def proxy_image(url: str = Query(..., description="Wikimedia image URL")):
    parsed = urlparse(url)
    if parsed.hostname not in ALLOWED_DOMAINS:
        raise HTTPException(status_code=400, detail="Only Wikimedia URLs are allowed")
    if not parsed.scheme.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL scheme")

    client = _get_client()
    try:
        resp = await client.get(url)
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Failed to fetch image")

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="Upstream error")

    content_type = resp.headers.get("content-type", "image/jpeg")
    return Response(
        content=resp.content,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=86400"},
    )
