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

    # Envío de resumen por correo (POST /analysis/send-summary-email)
    email_enabled: bool = Field(default=False, validation_alias="EMAIL_ENABLED")
    email_provider: str = Field(default="resend", validation_alias="EMAIL_PROVIDER")
    email_api_key: str = Field(default="", validation_alias="EMAIL_API_KEY")
    email_from: str = Field(
        default="DermaCheck <no-reply@dermacheck.cl>",
        validation_alias="EMAIL_FROM",
    )
    email_reply_to: str = Field(default="", validation_alias="EMAIL_REPLY_TO")
    email_rate_limit_per_minute: int = Field(
        default=5,
        ge=1,
        le=60,
        validation_alias="EMAIL_RATE_LIMIT_PER_MINUTE",
    )
    # SMTP (EMAIL_PROVIDER=smtp)
    email_smtp_host: str = Field(default="", validation_alias="EMAIL_SMTP_HOST")
    email_smtp_port: int = Field(default=587, validation_alias="EMAIL_SMTP_PORT")
    email_smtp_user: str = Field(default="", validation_alias="EMAIL_SMTP_USER")
    email_smtp_password: str = Field(default="", validation_alias="EMAIL_SMTP_PASSWORD")
    email_smtp_use_tls: bool = Field(default=True, validation_alias="EMAIL_SMTP_USE_TLS")

    # Cola de análisis facial (proceso único / tótem)
    analysis_queue_max_size: int = Field(
        default=10,
        ge=1,
        le=100,
        validation_alias="ANALYSIS_QUEUE_MAX_SIZE",
    )
    analysis_max_concurrent: int = Field(
        default=1,
        ge=1,
        le=4,
        validation_alias="ANALYSIS_MAX_CONCURRENT",
    )
    analysis_job_ttl_seconds: int = Field(
        default=3600,
        ge=60,
        le=86400,
        validation_alias="ANALYSIS_JOB_TTL_SECONDS",
    )
    analysis_job_poll_interval_hint: float = Field(
        default=1.5,
        ge=0.5,
        le=10.0,
        validation_alias="ANALYSIS_JOB_POLL_INTERVAL_HINT",
    )

    # Zona horaria para correos y presentación (Docker: TZ=America/Santiago)
    app_timezone: str = Field(
        default="America/Santiago",
        validation_alias="TZ",
    )


settings = Settings()
