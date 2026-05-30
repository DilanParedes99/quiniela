// components/AnimatedTitle.tsx
"use client";

import { motion } from "framer-motion";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

const lines = [
  {
    text: "JUEGA EN EQUIPO",
    fontSize: "clamp(1.6rem, 4vw, 3.2rem)",
    letterSpacing: "0.4rem",
    color: "#ffffff",
    stroke: "10px #0B8D38",
    textShadow: [
      // sombra dura más larga y sólida
      "10px 10px 10px #7A7862",
    ].join(", "),
  },
  {
    text: "CON",
    fontSize: "clamp(1.6rem, 3vw, 3.2rem)",
    color: "#ffffff",
    stroke: "10px #0B8D38",
    textShadow: [
      // sombra dura más larga y sólida
      "10px 10px 10px #7A7862",
    ].join(", "),
    letterSpacing: "0.4rem",
  },
  {
    text: "MarcoPolo",
    fontSize: "clamp(1.8rem, 15vw, 7rem)",
    color: "#820D17",
    stroke: "0px transparent",
    letterSpacing: "0.02rem",
    textShadow: [
      "-4px -4px 0 #fff",
      " 4px -4px 0 #fff",
      "-4px  4px 0 #fff",
      " 4px  4px 0 #fff",
      "-4px  0px 0 #fff",
      " 4px  0px 0 #fff",
      " 0px -4px 0 #fff",
      " 0px  4px 0 #fff",
      "15px 14px 10px #7A7862",
    ].join(", "),
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
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

export default function AnimatedTitle() {
  return (
    <div className="text-center ">
      {/* Líneas decorativas solo en la primera línea */}
      {/* <div className="flex items-center justify-center gap-4 mb-4">
        <AnimatedLine {...lines[0]} className="mb-2" />
      </div>

      <AnimatedLine {...lines[1]} className="mb-4" /> */}
      <AnimatedLine {...lines[2]} className="mb-2" />
    </div>
  );
}

function AnimatedLine({
  text,
  fontSize,
  color,
  letterSpacing,
  stroke,
  textShadow,
  className = "",
}: {
  text: string;
  fontSize: string;
  color: string;
  letterSpacing?: string;
  stroke: string;
  textShadow: string;
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
          className={montserrat.className}
          style={
            {
              fontSize,
              lineHeight: 0.95,
              letterSpacing: letterSpacing || "0.02em",
              color,
              WebkitTextStroke: stroke,
              paintOrder: "stroke fill",
              textShadow,
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
