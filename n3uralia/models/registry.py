"""
N3uralia Model Registry

Central place to register available enhancement models.
"""


class ModelRegistry:
    def __init__(self):
        self.models = {}

    def register(self, model):
        self.models[model.name] = model

    def get(self, name):
        return self.models.get(name)

    def available(self):
        return list(self.models.keys())
