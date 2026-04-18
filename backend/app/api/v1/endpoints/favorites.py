from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.deps import get_current_user
from app.repositories.favorite import FavoriteRepository
from app.schemas.favorite import FavoriteOut, FavoriteCreate
from app.schemas.common import MessageResponse
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[FavoriteOut])
async def list_favorites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = FavoriteRepository(db)
    favs = await repo.list_for_user(user.id)
    return [
        FavoriteOut(
            id=f.id,
            animal_id=f.animal_id,
            animal_slug=f.animal.slug if f.animal else None,
            animal_name=f.animal.common_name if f.animal else None,
            animal_thumbnail=f.animal.thumbnail_url if f.animal else None,
            created_at=f.created_at,
        )
        for f in favs
    ]


@router.post("", response_model=MessageResponse, status_code=201)
async def add_favorite(
    body: FavoriteCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = FavoriteRepository(db)
    try:
        await repo.add(user.id, body.animal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Already in favorites")
    return MessageResponse(message="Added to favorites")


@router.delete("/{animal_id}", response_model=MessageResponse)
async def remove_favorite(
    animal_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = FavoriteRepository(db)
    removed = await repo.remove(user.id, animal_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return MessageResponse(message="Removed from favorites")
