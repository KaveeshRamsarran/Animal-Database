"""Test which animal image URLs are accessible - all 244."""
import asyncio
import httpx

TARGET = [
    "Bald Eagle", "King Cobra", "Kiwi", "Mandrill", "Nile Crocodile",
    "Raccoon", "Red Fox", "Red Kangaroo", "Three-toed Sloth", "Wandering Albatross",
]

async def test_images():
    # Fetch all animals from API
    all_animals = []
    for page in range(1, 14):
        async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=10) as api:
            r = await api.get("/api/v1/animals", params={"page": page, "size": 20})
            items = r.json().get("items", [])
            if not items:
                break
            all_animals.extend(items)

    # Filter to target animals
    target_animals = [a for a in all_animals if a["common_name"] in TARGET]
    print(f"Found {len(target_animals)} target animals out of {len(all_animals)} total\n")

    for a in target_animals:
        hero = a.get("hero_image_url", "")
        thumb = a.get("thumbnail_url", "")
        print(f"{a['common_name']}:")
        print(f"  hero:  {hero[:120] if hero else 'NONE'}")
        print(f"  thumb: {thumb[:120] if thumb else 'NONE'}")

        # Test direct access to hero
        async with httpx.AsyncClient(follow_redirects=True, timeout=10) as client:
            for label, url in [("hero", hero), ("thumb", thumb)]:
                if not url:
                    continue
                try:
                    resp = await client.get(url, headers={"User-Agent": "WildAtlas/1.0"})
                    ct = resp.headers.get("content-type", "?")
                    print(f"  {label} direct: {resp.status_code} type={ct} size={len(resp.content)}")
                except Exception as e:
                    print(f"  {label} direct: ERROR {e}")

        # Test via proxy
        async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=15) as client:
            test_url = hero or thumb
            if test_url:
                try:
                    resp = await client.get("/api/v1/images/proxy", params={"url": test_url})
                    ct = resp.headers.get("content-type", "?")
                    print(f"  proxy: {resp.status_code} type={ct} size={len(resp.content)}")
                except Exception as e:
                    print(f"  proxy: ERROR {e}")
        print()

asyncio.run(test_images())
