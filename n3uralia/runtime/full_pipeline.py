"""
N3uralia Full Runtime Pipeline

Combines analysis, strategy, native enhancement and evaluation.
"""

from n3uralia.engine.orchestrator import N3uraliaEngine
from n3uralia.native.pipeline import NativeEnhancementPipeline
from n3uralia.evaluation.benchmark import BenchmarkEngine


class N3uraliaFullPipeline:
    def __init__(self):
        self.engine = N3uraliaEngine()
        self.native_pipeline = NativeEnhancementPipeline()
        self.benchmark = BenchmarkEngine()

    def process(self, image_path: str):
        analysis = self.engine.process(image_path)

        category = analysis.get("vision", {}).get(
            "category",
            "general",
        )

        enhancement = self.native_pipeline.process(
            image_path,
            category=category,
        )

        return {
            "analysis": analysis,
            "enhancement": enhancement,
            "status": "completed",
        }
