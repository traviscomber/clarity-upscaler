"""
N3uralia -> Philz Clarity bridge

This module prepares enhancement parameters without changing
predict.py yet. It allows safe integration testing.
"""

from n3uralia.router.preservation_router import PreservationRouter


class ClarityBridge:
    """Translate N3uralia decisions into Clarity parameters."""

    def __init__(self):
        self.router = PreservationRouter()

    def prepare_parameters(self, category: str) -> dict:
        profile = self.router.route(category)

        return {
            "creativity": profile.creativity,
            "resemblance": profile.resemblance,
            "profile": profile.profile,
            "preserve_identity": profile.preserve_identity,
            "preserve_geometry": profile.preserve_geometry,
        }
