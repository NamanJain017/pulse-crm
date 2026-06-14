from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    CRM_RECEIPT_URL: str = "http://localhost:8000/api/v1/receipts"
    TIME_COMPRESSION_FACTOR: int = 60   # Divide all real-world delays by this
    MAX_RETRIES: int = 3
    RETRY_BASE_DELAY: float = 1.0       # seconds — doubles each retry

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"


settings = Settings()
