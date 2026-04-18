import asyncio, httpx

async def test():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    }
    url = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/320px-African_Bush_Elephant.jpg"
    async with httpx.AsyncClient(follow_redirects=True, timeout=15, headers=headers) as client:
        # Test with GET (not HEAD) and delay
        r = await client.get(url)
        print(f"Status: {r.status_code}, Content-Type: {r.headers.get('content-type','?')}, Size: {len(r.content)} bytes")

asyncio.run(test())
