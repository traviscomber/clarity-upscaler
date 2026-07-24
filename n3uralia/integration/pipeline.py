"""
N3uralia Enhancement Pipeline

Safe orchestration layer between N3uralia intelligence
and the Philz Clarity core.

The original Clarity inference remains unchanged.
"""

from n3uralia.integration.config import N3URALIA_ENABLED
from n3uralia.integration.clarity_bridge import ClarityBridge
from n3uralia.vision.classifier import VisionClassifier


class N3uraliaPipeline:
    def __init__(self):
        self.vision = VisionClassifier()
        self.bridge = ClarityBridge()

    def analyze(self, image_path: str) -> dict:
        if not N3URALIA_ENABLED:
            return {
                "enabled": False
            }

        vision_result = self.vision.classify(image_path)
        parameters = self.bridge.prepare_parameters(
            vision_result.category
        )

        return {
            "enabled": True,
            "category": vision_result.category,
            "confidence": vision_result.confidence,
            "parameters": parameters,
        }
