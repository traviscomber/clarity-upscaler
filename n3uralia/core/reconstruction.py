"""
N3uralia Reconstruction Core

Defines how missing information should be recovered.

This is independent from any specific AI backend.
"""

from dataclasses import dataclass


@dataclass
class ReconstructionPlan:
    method: str
    detail_recovery: float
    creativity: float
    preserve_structure: bool


class ReconstructionEngine:
    """Creates reconstruction strategies from image analysis."""

    def create_plan(self, image_type: str, degradation) -> ReconstructionPlan:
        if image_type == "portrait":
            return ReconstructionPlan(
                method="identity_preservation",
                detail_recovery=0.9,
                creativity=0.1,
                preserve_structure=True,
            )

        if image_type == "architecture":
            return ReconstructionPlan(
                method="structural_recovery",
                detail_recovery=0.85,
                creativity=0.2,
                preserve_structure=True,
            )

        if image_type == "nature":
            return ReconstructionPlan(
                method="organic_texture_recovery",
                detail_recovery=0.9,
                creativity=0.25,
                preserve_structure=False,
            )

        return ReconstructionPlan(
            method="general_enhancement",
            detail_recovery=0.8,
            creativity=0.15,
            preserve_structure=True,
        )
