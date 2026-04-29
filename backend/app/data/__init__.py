"""
Data package initialization.
"""

from .conditions_catalog import CONDITIONS_CATALOG, get_condition, get_all_conditions
from .disclaimers import (
    MEDICAL_DISCLAIMER_MAIN,
    MEDICAL_DISCLAIMER_SHORT,
    REQUIRES_EVALUATION_MESSAGE,
    get_disclaimer_by_severity,
)

__all__ = [
    "CONDITIONS_CATALOG",
    "get_condition",
    "get_all_conditions",
    "MEDICAL_DISCLAIMER_MAIN",
    "MEDICAL_DISCLAIMER_SHORT",
    "REQUIRES_EVALUATION_MESSAGE",
    "get_disclaimer_by_severity",
]
