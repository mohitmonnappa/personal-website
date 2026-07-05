"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";

export function TraceDivider() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-80px" });
  const pathControls = useAnimation();
  const dotControls = useAnimation();

  useEffect(() => {
    if (!isInView) return;

    let cancelled = false;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    // Replays the full draw-in/erase animation on a 4s cycle:
    // 1.1s draw + 0.3s dot-in + 1.8s hold + 0.2s dot-out + 0.6s erase = 4.0s.
    async function cycle() {
      while (!cancelled) {
        await pathControls.start({
          pathLength: 1,
          transition: { duration: 1.1, ease: "easeInOut" },
        });
        if (cancelled) break;

        await dotControls.start({
          opacity: 1,
          transition: { duration: 0.3 },
        });
        if (cancelled) break;

        await wait(1800);
        if (cancelled) break;

        await dotControls.start({
          opacity: 0,
          transition: { duration: 0.2 },
        });
        if (cancelled) break;

        await pathControls.start({
          pathLength: 0,
          transition: { duration: 0.6, ease: "easeInOut" },
        });
      }
    }

    cycle();

    return () => {
      cancelled = true;
    };
  }, [isInView, pathControls, dotControls]);

  return (
    <div
      ref={containerRef}
      className="mx-auto my-20 h-10 w-full max-w-6xl px-6 sm:px-10"
      aria-hidden
    >
      <svg
        viewBox="0 0 1200 40"
        fill="none"
        className="h-10 w-full"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0 20 C 200 20, 260 4, 420 4 S 640 36, 800 36 S 1020 20, 1200 20"
          stroke="var(--color-clay)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={pathControls}
        />
        <motion.circle
          r="3.5"
          fill="var(--color-clay)"
          initial={{ opacity: 0 }}
          animate={dotControls}
          cx="800"
          cy="36"
        />
      </svg>
    </div>
  );
}
