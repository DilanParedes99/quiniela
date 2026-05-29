// components/AnimatedTitle.tsx
"use client";

import { motion } from "framer-motion";
import { Anton } from "next/font/google";

const anton = Anton({ weight: "400", subsets: ["latin"] });

const lines = [
  {
    text: "JUEGA EN EQUIPO",
    fontSize: "clamp(1.6rem, 7vw, 3.2rem)",
    color: "#011933",
    stroke: "6px #fff",
  },
  {
    text: "CON",
    fontSize: "clamp(1.6rem, 4vw, 3.2rem)",
    color: "#000000",
    stroke: "7px #fff",
  },
  {
    text: "MARCOPOLO",
    fontSize: "clamp(2.8rem, 17vw, 5.5rem)",
    color: "#8D0302",
    stroke: "9px #fff",
  },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04 },
  },
};

const letter = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function AnimatedTitle() {
  return (
    <div className="text-center mb-6">
      {/* Líneas decorativas solo en la primera línea */}
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="h-[2px] w-20 bg-white" />
        <AnimatedLine {...lines[0]} />
        <div className="h-[2px] w-20 bg-white" />
      </div>

      <AnimatedLine {...lines[1]} className="mb-1" />
      <AnimatedLine {...lines[2]} className="mb-2" />
    </div>
  );
}

function AnimatedLine({
  text,
  fontSize,
  color,
  stroke,
  className = "",
}: {
  text: string;
  fontSize: string;
  color: string;
  stroke: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`flex justify-center flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={letter}
          className={anton.className}
          style={
            {
              fontSize,
              lineHeight: 0.95,
              letterSpacing: "0.02em",
              color,
              WebkitTextStroke: stroke,
              paintOrder: "stroke fill",
              display: "inline-block",
              whiteSpace: char === " " ? "pre" : "normal",
            } as React.CSSProperties
          }
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
}
