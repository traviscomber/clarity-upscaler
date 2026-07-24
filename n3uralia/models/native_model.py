"""
N3uralia Native Model

Native execution model using the N3uralia enhancement pipeline.
"""

from n3uralia.models.base_model import N3uraliaModel
from n3uralia.native.pipeline import NativeEnhancementPipeline


class N3uraliaNativeModel(N3uraliaModel):
    name = "n3uralia_native_v1"

    def __init__(self, model_path=None, loras=None):
        self.model_path = model_path
        self.loras = loras or []
        self.pipeline = NativeEnhancementPipeline()

    def enhance(self, image, strategy):
        category = strategy.get("vision", {}).get("category", "general")

        result = self.pipeline.process(
            image,
            category=category,
        )

        result["model"] = self.name
        result["loras"] = self.loras
        result["model_path"] = self.model_path

        return result
