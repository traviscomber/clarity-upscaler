"""
N3uralia Enhancement Strategy Selector

Combines degradation and reconstruction information
into an enhancement decision.
"""


class EnhancementStrategy:
    def build(self, reconstruction_plan, degradation_report):
        return {
            "method": reconstruction_plan.method,
            "detail_recovery": reconstruction_plan.detail_recovery,
            "creativity": reconstruction_plan.creativity,
            "preserve_structure": reconstruction_plan.preserve_structure,
            "degradation": {
                "blur": degradation_report.blur_level,
                "noise": degradation_report.noise_level,
                "compression": degradation_report.compression_level,
                "detail_loss": degradation_report.detail_loss,
            },
        }
