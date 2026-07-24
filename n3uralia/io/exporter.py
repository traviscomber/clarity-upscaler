"""
N3uralia Image Exporter

Handles professional output formats while preserving
quality and metadata.
"""

from dataclasses import dataclass


@dataclass
class ExportConfig:
    format: str
    quality: int
    preserve_metadata: bool
    bit_depth: int


class ImageExporter:
    """Exports enhanced images for different workflows."""

    PROFILES = {
        "web": ExportConfig(
            format="webp",
            quality=95,
            preserve_metadata=False,
            bit_depth=8,
        ),
        "photo": ExportConfig(
            format="png",
            quality=100,
            preserve_metadata=True,
            bit_depth=16,
        ),
        "studio": ExportConfig(
            format="tiff",
            quality=100,
            preserve_metadata=True,
            bit_depth=16,
        ),
        "vfx": ExportConfig(
            format="exr",
            quality=100,
            preserve_metadata=True,
            bit_depth=32,
        ),
    }

    def get_profile(self, mode="photo"):
        return self.PROFILES.get(
            mode,
            self.PROFILES["photo"],
        )
