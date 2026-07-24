'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ModelCardProps {
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  recommended?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function ModelCard({
  name,
  description,
  category,
  capabilities,
  recommended = false,
  selected = false,
  onSelect,
}: ModelCardProps) {
  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`text-left p-6 rounded-lg border transition-all ${
        selected
          ? 'bg-accent-gold/10 border-accent-gold ring-1 ring-accent-gold/20'
          : 'bg-surface border-border hover:border-accent-gold/50'
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-block px-2 py-1 rounded text-xs font-medium text-accent-gold bg-accent-gold/10 mb-2">
              {category}
            </div>
            <h3 className="text-lg font-medium">{name}</h3>
            <p className="text-sm text-muted/70 mt-1">{description}</p>
          </div>
          {recommended && (
            <div className="px-2 py-1 rounded text-xs font-medium bg-accent-gold/20 text-accent-gold">
              Recommended
            </div>
          )}
        </div>

        {/* Capabilities */}
        <div className="space-y-2">
          <div className="text-xs text-muted font-medium uppercase tracking-wide">Optimized for:</div>
          <ul className="space-y-1">
            {capabilities.map((capability) => (
              <li key={capability} className="text-sm flex items-center gap-2 text-muted">
                <Check size={14} className="text-accent-gold flex-shrink-0" />
                {capability}
              </li>
            ))}
          </ul>
        </div>

        {/* Selection indicator */}
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 text-accent-gold text-sm font-medium"
          >
            <Check size={16} />
            Selected for enhancement
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
