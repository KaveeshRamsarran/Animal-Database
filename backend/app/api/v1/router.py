from fastapi import APIRouter
from app.api.v1.endpoints import animals, auth, map, regions, favorites, admin, behaviors, stats, images

router = APIRouter(prefix="/api/v1")

router.include_router(animals.router, prefix="/animals", tags=["animals"])
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(map.router, prefix="/map", tags=["map"])
router.include_router(regions.router, tags=["regions"])
router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
router.include_router(admin.router, prefix="/admin", tags=["admin"])
router.include_router(behaviors.router, prefix="/behaviors", tags=["behaviors"])
router.include_router(stats.router, prefix="/stats", tags=["stats"])
router.include_router(images.router, prefix="/images", tags=["images"])
