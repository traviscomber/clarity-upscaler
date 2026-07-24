"""
N3uralia Dataset Quality Validator

Validates training samples before LoRA/model training.
"""

from dataclasses import dataclass


@dataclass
class DatasetQualityReport:
    quality_score: float
    usable: bool
    issues: list


class DatasetValidator:
    """Checks dataset samples for training readiness."""

    def validate(self, sample) -> DatasetQualityReport:
        issues = []

        if not getattr(sample, "image_path", None):
            issues.append("missing_image")

        if not getattr(sample, "caption", None):
            issues.append("missing_caption")

        if not getattr(sample, "category", None):
            issues.append("missing_category")

        score = max(0.0, 1.0 - (len(issues) * 0.25))

        return DatasetQualityReport(
            quality_score=score,
            usable=score >= 0.75,
            issues=issues,
        )
