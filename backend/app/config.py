from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str
    OPENROUTER_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    CHANNEL_STUB_URL: str = "http://localhost:8001"
    SECRET_KEY: str = "dev-secret-change-in-production"
    TIME_COMPRESSION_FACTOR: int = 60
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
