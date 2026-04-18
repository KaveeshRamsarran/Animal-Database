from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    APP_NAME: str = "WildAtlas"
    DEBUG: bool = False
    DATABASE_URL: str = "postgresql+asyncpg://wildatlas:wildatlas@db:5432/wildatlas"
    DATABASE_URL_SYNC: str = "postgresql://wildatlas:wildatlas@db:5432/wildatlas"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    GBIF_API_URL: str = "https://api.gbif.org/v1"
    INATURALIST_API_URL: str = "https://api.inaturalist.org/v1"
    WIKIPEDIA_API_URL: str = "https://en.wikipedia.org/api/rest_v1"
    REST_COUNTRIES_URL: str = "https://restcountries.com/v3.1"
    ADMIN_EMAIL: str = "admin@wildatlas.io"
    ADMIN_PASSWORD: str = "admin123"
    REDIS_URL: str | None = None

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()
