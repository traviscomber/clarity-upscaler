"""
N3uralia LoRA Training Configuration

Defines training profiles for future custom models.
"""

from dataclasses import dataclass


@dataclass
class LoRAConfig:
    name: str
    base_model: str
    rank: int
    alpha: int
    resolution: int
    steps: int


N3URALIA_PRESERVATION_V1 = LoRAConfig(
    name="n3uralia_preservation_v1",
    base_model="SDXL",
    rank=16,
    alpha=16,
    resolution=1024,
    steps=5000,
)

N3URALIA_ARCHITECTURE_V1 = LoRAConfig(
    name="n3uralia_architecture_v1",
    base_model="SDXL",
    rank=32,
    alpha=32,
    resolution=1024,
    steps=6000,
)
