"""
N3uralia Model Registry

Central place to register available enhancement models.
"""

from n3uralia.models.philz_model import PhilzClarityModel


class ModelRegistry:
    def __init__(self):
        self.models = {}
        self.register(PhilzClarityModel())

    def register(self, model):
        self.models[model.name] = model

    def get(self, name):
        return self.models.get(name)

    def available(self):
        return list(self.models.keys())
