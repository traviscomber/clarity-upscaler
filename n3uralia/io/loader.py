"""
N3uralia Image Loader

Designed for high resolution image workflows.
Supports large source files without forcing early resizing.
"""

from dataclasses import dataclass


@dataclass
class ImageMetadata:
    path: str
    width: int
    height: int
    format: str
    megapixels: float


class ImageLoader:
    """Loads images while preserving original resolution metadata."""

    def inspect(self, path: str) -> ImageMetadata:
        # Real PIL/OpenCV integration will populate these values.
        return ImageMetadata(
            path=path,
            width=0,
            height=0,
            format="unknown",
            megapixels=0.0,
        )

    def load(self, path: str):
        return {
            "path": path,
            "preserve_resolution": True,
            "tile_processing": True,
        }
