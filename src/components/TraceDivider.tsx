"use client";

import { motion } from "framer-motion";

export function TraceDivider() {
  return (
    <div className="mx-auto my-20 h-10 w-full max-w-6xl px-6 sm:px-10" aria-hidden>
      <svg
        viewBox="0 0 1200 40"
        fill="none"
        className="h-10 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 20 C 200 20, 260 4, 420 4 S 640 36, 800 36 S 1020 20, 1200 20"
          stroke="var(--color-line)"
          strokeWidth="1.5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
        <motion.circle
          r="3.5"
          fill="var(--color-clay)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.9, duration: 0.3 }}
          cx="800"
          cy="36"
        />
      </svg>
    </div>
  );
}
