import asyncio, httpx

async def check():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as c:
        # Test search
        r1 = await c.get("/api/v1/animals/search", params={"q": "lion", "limit": 5})
        print(f"Search 'lion': status={r1.status_code}, results={len(r1.json()) if r1.status_code==200 else r1.text[:200]}")

        # Test country animals
        r2 = await c.get("/api/v1/countries/AU/animals")
        print(f"AU animals: status={r2.status_code}, data={r2.json() if r2.status_code==200 else r2.text[:200]}")

        # Test hotspots
        r3 = await c.get("/api/v1/map/hotspots", params={"limit": 3})
        print(f"Hotspots: status={r3.status_code}, count={len(r3.json()) if r3.status_code==200 else r3.text[:200]}")

        # Check animal image URLs
        r4 = await c.get("/api/v1/animals", params={"page": 1, "size": 5})
        if r4.status_code == 200:
            for item in r4.json().get("items", [])[:5]:
                print(f"  {item['common_name']}: hero={item.get('hero_image_url','NONE')[:60]}, thumb={item.get('thumbnail_url','NONE')[:60]}")

asyncio.run(check())
