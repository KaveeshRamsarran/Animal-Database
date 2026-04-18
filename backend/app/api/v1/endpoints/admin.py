from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.session import get_db
from app.core.deps import require_admin
from app.models.sync_job import SyncJob
from app.schemas.admin import SyncJobOut, SyncRequest
from app.services.sync import run_animal_sync, run_occurrence_sync, run_image_sync

router = APIRouter()


@router.post("/sync", response_model=SyncJobOut)
async def trigger_sync(
    body: SyncRequest,
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    if body.job_type == "animals":
        job = await run_animal_sync(db)
    elif body.job_type == "occurrences":
        job = await run_occurrence_sync(db)
    elif body.job_type == "images":
        job = await run_image_sync(db)
    elif body.job_type == "all":
        job = await run_animal_sync(db)
        await run_occurrence_sync(db)
        await run_image_sync(db)
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid job type")
    return SyncJobOut.model_validate(job)


@router.get("/sync-jobs", response_model=list[SyncJobOut])
async def list_sync_jobs(
    _=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(SyncJob).order_by(desc(SyncJob.started_at)).limit(50))
    return [SyncJobOut.model_validate(j) for j in result.scalars().all()]
