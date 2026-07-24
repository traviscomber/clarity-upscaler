"""
N3uralia Runtime Result

Standard output format for all models and execution paths.
"""

from dataclasses import dataclass, field


@dataclass
class EnhancementResult:
    success: bool
    model: str
    image: str
    strategy: dict
    metrics: dict = field(default_factory=dict)
    output: str | None = None
    errors: list = field(default_factory=list)

    def to_dict(self):
        return {
            "success": self.success,
            "model": self.model,
            "image": self.image,
            "strategy": self.strategy,
            "metrics": self.metrics,
            "output": self.output,
            "errors": self.errors,
        }
