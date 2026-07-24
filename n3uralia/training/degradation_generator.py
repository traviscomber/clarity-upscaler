"""
N3uralia Synthetic Degradation Generator

Creates realistic degraded versions of images for
restoration training.

Purpose:
train models to recover real lost information.
"""

from dataclasses import dataclass


@dataclass
class DegradationProfile:
    blur: float
    noise: float
    compression: float
    resolution_scale: float


class DegradationGenerator:
    def create_profile(self, preset="photo_restore"):
        profiles = {
            "photo_restore": DegradationProfile(
                blur=0.4,
                noise=0.3,
                compression=0.4,
                resolution_scale=0.25,
            ),
            "old_archive": DegradationProfile(
                blur=0.7,
                noise=0.6,
                compression=0.7,
                resolution_scale=0.125,
            ),
            "digital_low_quality": DegradationProfile(
                blur=0.2,
                noise=0.2,
                compression=0.8,
                resolution_scale=0.5,
            ),
        }

        return profiles.get(
            preset,
            profiles["photo_restore"],
        )
