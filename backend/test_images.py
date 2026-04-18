"""Test which animal image URLs are accessible."""
import asyncio
import httpx

async def test_images():
    async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=10) as api:
        r = await api.get("/api/v1/animals", params={"page": 1, "size": 100})
        animals = r.json().get("items", [])

    broken = []
    working = []
    async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
        for a in animals:
            url = a.get("thumbnail_url") or a.get("hero_image_url")
            if not url:
                broken.append((a["common_name"], "NO_URL"))
                continue
            try:
                resp = await client.head(url)
                if resp.status_code == 200:
                    working.append(a["common_name"])
                else:
                    broken.append((a["common_name"], f"HTTP_{resp.status_code}", url[:80]))
            except Exception as e:
                broken.append((a["common_name"], str(e)[:50], url[:80]))

    print(f"\nWorking: {len(working)}/{len(animals)}")
    print(f"Broken: {len(broken)}/{len(animals)}")
    for item in broken:
        print(f"  BROKEN: {item}")

asyncio.run(test_images())
