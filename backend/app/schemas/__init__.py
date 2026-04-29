"""
Esquemas Pydantic centralizados.
"""

# Importar desde el archivo schemas.py del nivel superior (auth y consent)
# Usamos importación absoluta desde el módulo app.schemas (el archivo .py)
import importlib.util
import sys
from pathlib import Path

# Cargar schemas.py directamente
schemas_file = Path(__file__).parent.parent / "schemas.py"
spec = importlib.util.spec_from_file_location("legacy_schemas", schemas_file)
legacy_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(legacy_module)

# Extraer schemas del módulo legacy
AcceptanceOut = legacy_module.AcceptanceOut
AcceptItemIn = legacy_module.AcceptItemIn
AuthResponse = legacy_module.AuthResponse
ConsentAcceptIn = legacy_module.ConsentAcceptIn
ConsentAcceptResponse = legacy_module.ConsentAcceptResponse
LoginIn = legacy_module.LoginIn
RegisterIn = legacy_module.RegisterIn
UserOut = legacy_module.UserOut

# Importar desde módulos de la carpeta schemas/ (analysis y diagnosis)
from .analysis import (
    AnalysisResponse,
    AnalysisResult,
    DetectionBox,
    ErrorDetail,
    ErrorResponse,
    ImageInfo,
    InferenceResponse,
)
from .diagnosis import (
    DetectedCondition,
    DiagnosisResponse,
    DiagnosisResult,
)

__all__ = [
    # Auth & Consent schemas
    "AcceptanceOut",
    "AcceptItemIn",
    "AuthResponse",
    "ConsentAcceptIn",
    "ConsentAcceptResponse",
    "LoginIn",
    "RegisterIn",
    "UserOut",
    # Analysis schemas
    "AnalysisResponse",
    "AnalysisResult",
    "DetectionBox",
    "ErrorDetail",
    "ErrorResponse",
    "ImageInfo",
    "InferenceResponse",
    # Diagnosis schemas
    "DetectedCondition",
    "DiagnosisResponse",
    "DiagnosisResult",
]
