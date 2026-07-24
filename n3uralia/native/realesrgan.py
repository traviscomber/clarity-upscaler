"""
N3uralia RealESRGAN Backend

First native super-resolution backend.

This is a model adapter layer. The actual weights and
inference implementation can be connected without changing
the N3uralia engine.
"""

from n3uralia.native.upscaler import NativeUpscaler


class RealESRGANUpscaler(NativeUpscaler):
    name = "realesrgan"

    def __init__(self, model_path=None):
        self.model_path = model_path

    def upscale(self, image, scale=4):
        return {
            "model": self.name,
            "image": image,
            "scale": scale,
            "model_path": self.model_path,
            "status": "ready_for_weights",
        }
