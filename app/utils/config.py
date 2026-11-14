import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings and configuration parameters.
    
    Reads from environment variables and an optional .env file.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # Core Application Settings
    APP_NAME: str = "AgriShift AI"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True
    CORS_ORIGINS: str = "*"

    # NASA Earthdata Authentication (for DAAC datasets like GPM IMERG and SMAP)
    EARTHDATA_USERNAME: str = ""
    EARTHDATA_PASSWORD: str = ""

    # Default Target Region: Hooghly, West Bengal, India
    DEFAULT_LATITUDE: float = 22.90
    DEFAULT_LONGITUDE: float = 88.40

    # NASA POWER API Settings
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    NASA_POWER_TIMEOUT: int = 30
    NASA_POWER_LAG_DAYS: int = 4


# Global cached settings instance
settings = Settings()
