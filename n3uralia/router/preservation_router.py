"""
N3uralia Preservation Router

Converts vision analysis into enhancement constraints.

This layer protects important image information before
passing parameters to the Philz Clarity core.
"""

from dataclasses import dataclass


@dataclass
class EnhancementParameters:
    creativity: float
    resemblance: float
    preserve_identity: bool
    preserve_geometry: bool
    profile: str


class PreservationRouter:
    """Maps preservation profiles to Clarity parameters."""

    def route(self, category: str) -> EnhancementParameters:
        profiles = {
            "portrait": EnhancementParameters(
                creativity=0.10,
                resemblance=1.2,
                preserve_identity=True,
                preserve_geometry=False,
                profile="face_restore",
            ),
            "architecture": EnhancementParameters(
                creativity=0.20,
                resemblance=0.95,
                preserve_identity=False,
                preserve_geometry=True,
                profile="architecture_restore",
            ),
            "nature": EnhancementParameters(
                creativity=0.25,
                resemblance=0.9,
                preserve_identity=False,
                preserve_geometry=True,
                profile="nature_restore",
            ),
        }

        return profiles.get(
            category,
            EnhancementParameters(
                creativity=0.15,
                resemblance=1.0,
                preserve_identity=True,
                preserve_geometry=True,
                profile="clean_enhance",
            ),
        )
