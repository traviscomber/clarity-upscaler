"""
N3uralia Native Enhancement Pipeline

Combines native upscaling and refinement stages.
"""

from n3uralia.native.realesrgan import RealESRGANUpscaler
from n3uralia.native.texture_refiner import TextureRefiner


class NativeEnhancementPipeline:
    def __init__(self):
        self.upscaler = RealESRGANUpscaler()
        self.refiner = TextureRefiner()

    def process(self, image, category="general", scale=4):
        upscale_result = self.upscaler.upscale(
            image,
            scale=scale,
        )

        refinement = self.refiner.create_profile(category)

        return {
            "image": image,
            "upscale": upscale_result,
            "refinement": refinement.__dict__,
            "status": "pipeline_ready",
        }
