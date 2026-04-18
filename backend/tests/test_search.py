import pytest


@pytest.mark.asyncio
async def test_search_empty_query(client):
    resp = await client.get("/api/v1/animals/search", params={"q": "x"})
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_list_with_filters(client):
    resp = await client.get("/api/v1/animals", params={
        "class_name": "Mammalia", "diet": "Carnivore", "sort": "popularity"
    })
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_list_with_search(client):
    resp = await client.get("/api/v1/animals", params={"search": "tiger"})
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_map_hotspots(client):
    resp = await client.get("/api/v1/map/hotspots")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_behaviors(client):
    resp = await client.get("/api/v1/behaviors")
    assert resp.status_code == 200
