from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Por defecto: SQLite en archivo (sin instalar servidor). Sobrescribe con DATABASE_URL en .env para MySQL local.
    database_url: str = "sqlite:///./dermacheck.db"
    api_prefix: str = "/api/v1"


settings = Settings()
