"""
N3uralia Model Interface

Defines the contract for enhancement models.
Models are interchangeable components.
"""

from abc import ABC, abstractmethod


class N3uraliaModel(ABC):
    name = "base"

    @abstractmethod
    def enhance(self, image, strategy):
        pass
