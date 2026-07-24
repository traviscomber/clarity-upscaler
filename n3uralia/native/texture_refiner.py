"""
N3uralia Texture Refinement Layer

Adds a refinement stage after super resolution.

Purpose:
- preserve original texture
- control hallucinated detail
- prepare future LoRA integration
"""

from dataclasses import dataclass


@dataclass
class RefinementProfile:
    texture_strength: float
    preservation_strength: float
    creativity_limit: float


class TextureRefiner:
    name = "n3uralia_texture_refiner"

    def create_profile(self, category="general"):
        profiles = {
            "portrait": RefinementProfile(
                texture_strength=0.4,
                preservation_strength=1.0,
                creativity_limit=0.1,
            ),
            "architecture": RefinementProfile(
                texture_strength=0.8,
                preservation_strength=0.95,
                creativity_limit=0.2,
            ),
            "nature": RefinementProfile(
                texture_strength=0.9,
                preservation_strength=0.85,
                creativity_limit=0.25,
            ),
        }

        return profiles.get(
            category,
            RefinementProfile(
                texture_strength=0.6,
                preservation_strength=0.9,
                creativity_limit=0.15,
            ),
        )
