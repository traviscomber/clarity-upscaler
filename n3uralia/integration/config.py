"""
N3uralia integration configuration.

Keeps the Philz Clarity core stable while allowing
incremental activation of intelligence layers.
"""

N3URALIA_ENABLED = True

# Safe mode: analyzer decisions are generated but do not
# overwrite user parameters until validation is complete.
AUTO_PARAMETER_OVERRIDE = False

# Future: enable trained preservation LoRAs.
ENABLE_N3URALIA_LORAS = False

DEFAULT_PROFILE = "clean_enhance"
