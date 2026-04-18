from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models so Alembic can detect them
from app.models.user import User  # noqa
from app.models.animal import Animal  # noqa
from app.models.behavior import Behavior, AnimalBehavior  # noqa
from app.models.country import Country  # noqa
from app.models.continent import Continent  # noqa
from app.models.occurrence import Occurrence  # noqa
from app.models.conservation import ConservationStatus  # noqa
from app.models.habitat import Habitat  # noqa
from app.models.image import Image  # noqa
from app.models.fact import Fact  # noqa
from app.models.favorite import Favorite  # noqa
from app.models.sync_job import SyncJob  # noqa
from app.models.api_source import ApiSource  # noqa
