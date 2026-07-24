'use client';

import { motion } from 'framer-motion';

interface QualityMetricsProps {
  fidelity: number;
  detail: number;
  preservation: number;
  processing?: boolean;
}

export function QualityMetrics({
  fidelity,
  detail,
  preservation,
  processing = false,
}: QualityMetricsProps) {
  const metrics = [
    { label: 'Fidelity', value: fidelity, description: 'Color and tone accuracy' },
    { label: 'Detail Recovery', value: detail, description: 'Fine detail enhancement' },
    { label: 'Preservation', value: preservation, description: 'Original content integrity' },
  ];

  return (
    <div className="space-y-3">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">{metric.label}</span>
            <span className="text-sm font-medium text-accent-gold">{metric.value}%</span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent-gold"
              initial={{ width: processing ? 0 : metric.value }}
              animate={{ width: `${metric.value}%` }}
              transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
            />
          </div>
          <p className="text-xs text-muted/60">{metric.description}</p>
        </motion.div>
      ))}
    </div>
  );
}
