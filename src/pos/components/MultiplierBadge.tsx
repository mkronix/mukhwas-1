import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiplierBadgeProps {
  multiplier: number;
}

export const MultiplierBadge: React.FC<MultiplierBadgeProps> = ({ multiplier }) => {
  return (
    <AnimatePresence>
      {multiplier > 1 && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="inline-flex items-center justify-center h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-bold"
        >
          ×{multiplier}
        </motion.span>
      )}
    </AnimatePresence>
  );
};
