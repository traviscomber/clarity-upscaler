"""
Philz Clarity Model

Philz implementation as a N3uralia-compatible model.

This keeps the existing Clarity technology available while
allowing future native N3uralia models.
"""

from n3uralia.models.base_model import N3uraliaModel


class PhilzClarityModel(N3uraliaModel):
    name = "philz_clarity"

    def __init__(self, adapter=None):
        self.adapter = adapter

    def enhance(self, image, strategy):
        if self.adapter:
            return self.adapter.enhance(image, strategy)

        return {
            "model": self.name,
            "image": image,
            "strategy": strategy,
            "status": "adapter_required",
        }
