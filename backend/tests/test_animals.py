import pytest


@pytest.mark.asyncio
async def test_list_animals_empty(client):
    resp = await client.get("/api/v1/animals")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_featured_animals(client):
    resp = await client.get("/api/v1/animals/featured")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_animal_not_found(client):
    resp = await client.get("/api/v1/animals/nonexistent-slug")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_search_animals(client):
    resp = await client.get("/api/v1/animals/search", params={"q": "lion"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_stats(client):
    resp = await client.get("/api/v1/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_animals" in data


@pytest.mark.asyncio
async def test_continents(client):
    resp = await client.get("/api/v1/continents")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_countries(client):
    resp = await client.get("/api/v1/countries")
    assert resp.status_code == 200
