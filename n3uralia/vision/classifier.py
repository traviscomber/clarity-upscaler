"""
N3uralia Vision Classification Layer

Determines the preservation strategy before enhancement.

Future integrations:
- Vision LLM analysis
- CLIP classification
- object detection
- face detection
- architecture recognition
"""

from dataclasses import dataclass


@dataclass
class VisionResult:
    category: str
    confidence: float
    recommended_profile: str


class VisionClassifier:
    """Routes images into preservation profiles."""

    def classify(self, image_path: str) -> VisionResult:
        # Placeholder until vision models are integrated.
        return VisionResult(
            category="unknown",
            confidence=0.0,
            recommended_profile="clean_enhance",
        )
