"""Image proxy for Wikimedia images to avoid browser UA/extension blocking."""
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from urllib.parse import urlparse
import httpx
import re

router = APIRouter()

ALLOWED_DOMAINS = {"upload.wikimedia.org", "commons.wikimedia.org"}

# Wikimedia standard thumbnail steps (non-standard sizes get 429)
_STANDARD_STEPS = [20, 40, 60, 120, 250, 330, 500, 960, 1280, 1920, 3840]
_THUMB_RE = re.compile(r'/(\d+)px-')

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


def _normalize_thumb_url(url: str) -> str:
    """Rewrite non-standard Wikimedia thumbnail widths to the nearest standard step."""
    m = _THUMB_RE.search(url)
    if not m:
        return url
    current = int(m.group(1))
    if current in _STANDARD_STEPS:
        return url
    # Find smallest standard step >= current
    for step in _STANDARD_STEPS:
        if step >= current:
            return url[:m.start(1)] + str(step) + url[m.end(1):]
    return url[:m.start(1)] + str(_STANDARD_STEPS[-1]) + url[m.end(1):]


@router.get("/proxy")
async def proxy_image(url: str = Query(..., description="Wikimedia image URL")):
    parsed = urlparse(url)
    if parsed.hostname not in ALLOWED_DOMAINS:
        raise HTTPException(status_code=400, detail="Only Wikimedia URLs are allowed")
    if not parsed.scheme.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL scheme")

    # Normalize thumbnail size to avoid Wikimedia 429 errors
    normalized_url = _normalize_thumb_url(url)

    client = _get_client()
    try:
        resp = await client.get(normalized_url)
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Failed to fetch image")

    if resp.status_code == 429 and '/thumb/' in normalized_url:
        # Fallback: try the original (non-thumbnail) URL
        original_url = re.sub(r'/thumb(/.*?)(/\d+px-[^/]+)$', r'\1', normalized_url)
        try:
            resp = await client.get(original_url)
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
