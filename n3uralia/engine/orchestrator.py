"""
N3uralia Engine Orchestrator

Main intelligence layer.
Backends are replaceable components.
"""

from n3uralia.backends.philz_adapter import PhilzAdapter
from n3uralia.integration.pipeline import N3uraliaPipeline


class N3uraliaEngine:
    def __init__(self):
        self.pipeline = N3uraliaPipeline()
        self.backend = PhilzAdapter()

    def process(self, image_path: str, category: str = "unknown"):
        analysis = self.pipeline.analyze(image_path)

        return self.backend.enhance(
            image_path,
            analysis,
        )
