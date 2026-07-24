"""
N3uralia Engine Orchestrator

Central intelligence layer for the native N3uralia pipeline.

Backends are replaceable components.
Philz is treated as one backend, not the product identity.
"""

from n3uralia.core.degradation import DegradationAnalyzer
from n3uralia.core.reconstruction import ReconstructionEngine
from n3uralia.vision.classifier import VisionClassifier
from n3uralia.backends.philz_adapter import PhilzAdapter


class N3uraliaEngine:
    def __init__(self):
        self.vision = VisionClassifier()
        self.degradation = DegradationAnalyzer()
        self.reconstruction = ReconstructionEngine()
        self.backend = PhilzAdapter()

    def process(self, image_path: str):
        vision = self.vision.classify(image_path)
        degradation = self.degradation.analyze(image_path)

        plan = self.reconstruction.create_plan(
            vision.category,
            degradation,
        )

        return self.backend.enhance(
            image_path,
            {
                "vision": vision.__dict__,
                "degradation": degradation.__dict__,
                "reconstruction": plan.__dict__,
            },
        )
