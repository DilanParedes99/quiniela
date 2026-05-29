// components/Confetti.tsx
"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#8D0302", "#ffffff", "#F4D5AA", "#011933", "#FFD700"];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
}

function createParticle(canvasWidth: number): Particle {
  return {
    x: Math.random() * canvasWidth,
    y: -10,
    vx: (Math.random() - 0.5) * 2,
    vy: Math.random() * 3 + 2,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.2,
    width: Math.random() * 8 + 4,
    height: Math.random() * 4 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 1,
  };
}

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let elapsed = 0;
    const DURATION = 40000; // ms emitiendo partículas
    const EMIT_RATE = 1; // partículas por frame al inicio

    function resize() {
      canvas!.width = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let lastTime = performance.now();

    function loop(now: number) {
      const delta = now - lastTime;
      lastTime = now;
      elapsed += delta;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Emitir partículas nuevas solo durante DURATION
      if (elapsed < DURATION) {
        for (let i = 0; i < EMIT_RATE; i++) {
          particles.push(createParticle(canvas!.width));
        }
      }

      particles = particles.filter((p) => p.opacity > 0);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.05; // gravedad suave

        // Fade out cuando llega al 80% de la pantalla
        if (p.y > canvas!.height * 0.8) {
          p.opacity -= 0.02;
        }

        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.opacity);
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.angle);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx!.restore();
      }

      if (particles.length > 0 || elapsed < DURATION) {
        animId = requestAnimationFrame(loop);
      }
    }

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
    />
  );
}
