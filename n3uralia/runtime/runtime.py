"""
N3uralia Runtime Controller

Execution layer connecting the intelligence engine,
model registry and enhancement models.
"""

from n3uralia.engine.orchestrator import N3uraliaEngine
from n3uralia.models.registry import ModelRegistry
from n3uralia.models.philz_model import PhilzClarityModel
from n3uralia.models.native_model import N3uraliaNativeModel


class N3uraliaRuntime:
    def __init__(self):
        self.engine = N3uraliaEngine()
        self.registry = ModelRegistry()

        self.registry.register(PhilzClarityModel())
        self.registry.register(N3uraliaNativeModel())

    def execute(self, image_path: str, model_name="philz_clarity"):
        analysis = self.engine.process(image_path)
        model = self.registry.get(model_name)

        if model is None:
            raise ValueError(f"Unknown model: {model_name}")

        return model.enhance(
            image_path,
            analysis,
        )
