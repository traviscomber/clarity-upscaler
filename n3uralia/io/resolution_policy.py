"""
N3uralia Resolution Policy Engine

Selects safe processing strategies based on image size.
"""

from dataclasses import dataclass


@dataclass
class ProcessingPolicy:
    mode: str
    tile_size: int
    max_megapixels: int
    precision: str


class ResolutionPolicy:
    """Chooses GPU processing strategy for large images."""

    def select(self, megapixels: float) -> ProcessingPolicy:
        if megapixels <= 20:
            return ProcessingPolicy(
                mode="full_gpu",
                tile_size=0,
                max_megapixels=20,
                precision="fp16",
            )

        if megapixels <= 50:
            return ProcessingPolicy(
                mode="tile_gpu",
                tile_size=1024,
                max_megapixels=50,
                precision="fp16",
            )

        return ProcessingPolicy(
            mode="large_image_queue",
            tile_size=512,
            max_megapixels=100,
            precision="fp16",
        )
