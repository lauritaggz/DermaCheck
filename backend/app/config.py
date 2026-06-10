from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Por defecto: SQLite en archivo (sin instalar servidor). Sobrescribe con DATABASE_URL en .env para MySQL local.
    database_url: str = "sqlite:///./dermacheck.db"
    api_prefix: str = "/api/v1"

    # HU17: umbral YOLO para líneas de expresión (única fuente de verdad en backend).
    # Sobrescribir con DERMACHECK_EXPRESSION_LINES_CONF en .env (valor entre 0.0 y 1.0).
    expression_lines_conf_threshold: float = Field(
        default=0.65,
        ge=0.0,
        le=1.0,
        validation_alias="DERMACHECK_EXPRESSION_LINES_CONF",
    )

    # HU22: búsqueda de productos (scraper Farmacompara).
    product_search_cache_ttl_hours: int = Field(
        default=12,
        ge=6,
        le=24,
        validation_alias="PRODUCT_SEARCH_CACHE_TTL_HOURS",
    )
    product_search_max_results: int = Field(
        default=5,
        ge=3,
        le=10,
        validation_alias="PRODUCT_SEARCH_MAX_RESULTS",
    )
    product_search_min_results: int = Field(
        default=3,
        ge=1,
        le=5,
        validation_alias="PRODUCT_SEARCH_MIN_RESULTS",
    )
    product_search_enable_playwright: bool = Field(
        default=True,
        validation_alias="PRODUCT_SEARCH_ENABLE_PLAYWRIGHT",
    )


settings = Settings()
