"""
N3uralia Native Upscaler Interface

Core abstraction for native super resolution engines.

Future implementations:
- RealESRGAN engine
- SwinIR engine
- HAT engine
- custom N3uralia models
"""

from abc import ABC, abstractmethod


class NativeUpscaler(ABC):
    name = "native_upscaler"

    @abstractmethod
    def upscale(self, image, scale=4):
        pass
