import asyncio, httpx

async def check():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as c:
        # Test search
        r1 = await c.get("/api/v1/animals/search", params={"q": "lion", "limit": 5})
        print(f"Search lion: status={r1.status_code}, results={len(r1.json()) if r1.status_code==200 else r1.text[:200]}")
        
        # Test country animals
        r2 = await c.get("/api/v1/countries/AU/animals")
        if r2.status_code == 200:
            data = r2.json()
            print(f"AU animals: status=200, total={data.get('total', 0)}")
            for item in data.get("items", []):
                print(f"  - {item['common_name']}")
        else:
            print(f"AU animals: status={r2.status_code}, error={r2.text[:200]}")
        
        # Test image proxy
        r3 = await c.get("/api/v1/animals", params={"page": 1, "size": 1})
        if r3.status_code == 200:
            items = r3.json().get("items", [])
            if items:
                img_url = items[0].get("thumbnail_url", "")
                print(f"Testing proxy for: {items[0]['common_name']}")
                r4 = await c.get("/api/v1/images/proxy", params={"url": img_url}, timeout=15)
                print(f"Proxy: status={r4.status_code}, content-type={r4.headers.get('content-type','?')}, size={len(r4.content)}")
        
        # Test hotspots
        r5 = await c.get("/api/v1/map/hotspots", params={"limit": 3})
        print(f"Hotspots: status={r5.status_code}, count={len(r5.json()) if r5.status_code==200 else r5.text[:100]}")

asyncio.run(check())
