"""
N3uralia Benchmark Engine

Compares enhancement models using a shared evaluation flow.
"""

from dataclasses import dataclass

from n3uralia.evaluation.metrics import QualityMetrics


@dataclass
class BenchmarkResult:
    model: str
    metrics: dict


class BenchmarkEngine:
    def __init__(self):
        self.metrics = QualityMetrics()

    def evaluate(self, model_name: str, original, enhanced):
        scores = self.metrics.calculate(
            original,
            enhanced,
        )

        return BenchmarkResult(
            model=model_name,
            metrics=scores,
        )

    def compare(self, results):
        return sorted(
            results,
            key=lambda item: item.metrics.get("preservation_score", 0),
            reverse=True,
        )
