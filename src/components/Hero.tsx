"use client";

import { motion } from "framer-motion";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { Button } from "./Button";

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <Container wide className="pb-16 pt-16 sm:pb-24 sm:pt-24">
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.09 }}
        className="max-w-2xl"
      >
        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Eyebrow>Information Science · Security</Eyebrow>
        </motion.div>

        <motion.h1
          variants={item}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl"
        >
          Mohit Monnappa
        </motion.h1>

        <motion.p
          variants={item}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-5 text-lg leading-relaxed text-stone"
        >
          I study how systems break, and build tools that make them safer.
          Final-year Information Science student, currently deep in CTFs,
          machine writeups, and practical security tooling.
        </motion.p>

        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Button href="/writeups">Read writeups</Button>
          <Button href="/projects" variant="secondary">
            View projects
          </Button>
        </motion.div>
      </motion.div>
    </Container>
  );
}
