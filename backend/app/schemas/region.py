from pydantic import BaseModel


class CountryOut(BaseModel):
    id: int
    name: str
    code: str
    capital: str | None = None
    region: str | None = None
    subregion: str | None = None
    population: int | None = None
    flag_url: str | None = None
    wildlife_overview: str | None = None
    continent_name: str | None = None

    class Config:
        from_attributes = True
