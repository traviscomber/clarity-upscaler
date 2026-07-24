"""
N3uralia Evaluation Metrics

Common metrics for comparing enhancement outputs.
"""

from dataclasses import dataclass


@dataclass
class QualityMetrics:
    fidelity: float
    detail_recovery: float
    artifact_level: float
    preservation_score: float


class MetricsCalculator:
    def calculate(self, output, reference=None):
        return QualityMetrics(
            fidelity=0.0,
            detail_recovery=0.0,
            artifact_level=0.0,
            preservation_score=0.0,
        )
