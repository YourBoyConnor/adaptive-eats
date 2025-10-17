'use client';

import { motion } from 'framer-motion';

export function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
    />
  );
}
