"""
N3uralia Dataset Builder

Prepares image datasets for future LoRA and model training.

The objective is preservation and reconstruction learning,
not only style transfer.
"""

from dataclasses import dataclass


@dataclass
class TrainingSample:
    image_path: str
    caption: str
    category: str
    preservation_tags: list


class DatasetBuilder:
    def create_sample(
        self,
        image_path: str,
        caption: str,
        category: str,
        preservation_tags=None,
    ) -> TrainingSample:
        return TrainingSample(
            image_path=image_path,
            caption=caption,
            category=category,
            preservation_tags=preservation_tags or [],
        )
