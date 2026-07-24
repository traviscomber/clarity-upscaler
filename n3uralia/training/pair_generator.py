"""
N3uralia Training Pair Generator

Creates input/target relationships for restoration training.

Input: degraded image
Target: original high quality image
"""

from dataclasses import dataclass


@dataclass
class TrainingPair:
    input_image: str
    target_image: str
    degradation_profile: str
    category: str
    caption: str


class PairGenerator:
    """Builds restoration training pairs."""

    def create_pair(
        self,
        original_image: str,
        degraded_image: str,
        profile: str,
        category: str,
        caption: str,
    ) -> TrainingPair:
        return TrainingPair(
            input_image=degraded_image,
            target_image=original_image,
            degradation_profile=profile,
            category=category,
            caption=caption,
        )
