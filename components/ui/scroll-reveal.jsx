"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Global premium easing
const ease = [0.16, 1, 0.3, 1];

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
};

export function Reveal({
  children,
  preset = "fadeUp",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  amount = 0.2,
  as: Component = "div",
}) {
  const shouldReduceMotion = useReducedMotion();

  // If user prefers reduced motion, fallback to a simple fade without transforms
  const activeVariant = shouldReduceMotion ? variants.fadeIn : variants[preset];

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ duration, delay, ease }}
      variants={activeVariant}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}

const staggerPresets = {
  staggerFast: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  },
  staggerSoft: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  },
};

export function StaggerContainer({
  children,
  preset = "staggerSoft",
  className,
  once = true,
  amount = 0.2,
  as: Component = "div",
}) {
  const MotionComponent = motion(Component);
  
  return (
    <MotionComponent
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={staggerPresets[preset]}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}

export function StaggerItem({
  children,
  preset = "fadeUp",
  duration = 0.6,
  className,
  as: Component = "div",
}) {
  const shouldReduceMotion = useReducedMotion();
  const activeVariant = shouldReduceMotion ? variants.fadeIn : variants[preset];

  const MotionComponent = motion(Component);

  return (
    <MotionComponent
      transition={{ duration, ease }}
      variants={activeVariant}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}
