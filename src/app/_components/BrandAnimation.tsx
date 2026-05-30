"use client";

import { motion } from "framer-motion";

export function BrandAnimation() {
  return (
    <div className="relative h-10 min-w-0 flex-1 overflow-hidden sm:h-12">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.2, duration: 0.3 }}
        className="absolute left-0 top-1 flex items-baseline font-serif text-2xl tracking-tight sm:text-4xl"
      >
        <span>netflix</span>
        <motion.span animate={{ x: 48 }} transition={{ delay: 0.8, duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="ml-1.5 text-white/72 sm:ml-2">
          syndrome
        </motion.span>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.35, duration: 0.55 }}
        className="absolute left-0 top-1 font-serif text-2xl tracking-tight sm:text-4xl"
      >
        <span>Netflix </span>
        <span className="text-[color:var(--accent)]">De-Syndrome</span>
      </motion.div>
    </div>
  );
}
