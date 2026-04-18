import asyncio, httpx

async def check():
    async with httpx.AsyncClient(base_url="http://localhost:8000") as c:
        r1 = await c.get("/api/v1/animals", params={"page": 1, "size": 100})
        data = r1.json()
        items = data.get("items", data) if isinstance(data, dict) else data
        print(f"Animals: {len(items)}")

        r2 = await c.get("/api/v1/continents")
        print(f"Continents: {len(r2.json())}")

        r3 = await c.get("/api/v1/countries", params={"continent": "AF"})
        print(f"AF countries: {len(r3.json())}")

        r4 = await c.get("/api/v1/countries", params={"continent": "AS"})
        print(f"AS countries: {len(r4.json())}")

        r5 = await c.get("/api/v1/map/hotspots")
        print(f"Hotspots: {len(r5.json())}")

asyncio.run(check())
