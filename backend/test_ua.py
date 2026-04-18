import asyncio, httpx

async def test():
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"}
    urls = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/320px-African_Bush_Elephant.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Tiger_in_Ranthambhore.jpg/320px-Tiger_in_Ranthambhore.jpg",
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/320px-Grosser_Panda.JPG",
    ]
    async with httpx.AsyncClient(follow_redirects=True, timeout=10, headers=headers) as client:
        for url in urls:
            r = await client.head(url)
            print(f"{r.status_code}: {url[:70]}")

asyncio.run(test())
