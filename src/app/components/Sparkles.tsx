"use client";

import { useEffect, useRef } from "react";

interface SparklesProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

export default function Sparkles({ containerRef }: SparklesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLORS = [
      "#8D0302",
      "#FFD700",
      "#0B8D38",
      "#ffffff",
      "#ff4444",
      "#44ff88",
      "#ffcc00",
      "#ff8800",
    ];

    function resize() {
      if (!canvas || !containerRef?.current) return;
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      decay: number;
      radius: number;
      gravity: number;
      trail: { x: number; y: number; alpha: number }[];

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = 0.02 + Math.random() * 0.025; // antes 0.012
        this.radius = 2 + Math.random() * 2;
        this.gravity = 0.06;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: this.alpha });
        if (this.trail.length > 6) this.trail.shift();
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }
      draw() {
        this.trail.forEach((p, i) => {
          ctx!.beginPath();
          ctx!.arc(
            p.x,
            p.y,
            this.radius * (i / this.trail.length),
            0,
            Math.PI * 2,
          );
          ctx!.fillStyle = this.color;
          ctx!.globalAlpha = p.alpha * (i / this.trail.length) * 0.4;
          ctx!.fill();
        });
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fillStyle = this.color;
        ctx!.globalAlpha = this.alpha;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    class Rocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      color: string;
      exploded: boolean;
      trail: { x: number; y: number }[];

      constructor() {
        this.x = canvas!.width * (0.1 + Math.random() * 0.8);
        this.y = canvas!.height;
        this.targetY = canvas!.height * (0.05 + Math.random() * 0.5);
        this.vy = -5 - Math.random() * 4;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.exploded = false;
        this.trail = [];
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) this.trail.shift();
        this.y += this.vy;
        this.vy *= 0.98;
        if (this.y <= this.targetY) this.exploded = true;
      }
      draw() {
        this.trail.forEach((p, i) => {
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, 2 * (i / this.trail.length), 0, Math.PI * 2);
          ctx!.fillStyle = this.color;
          ctx!.globalAlpha = (i / this.trail.length) * 0.7;
          ctx!.fill();
        });
        ctx!.globalAlpha = 1;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx!.fillStyle = "#fff";
        ctx!.fill();
      }
      explode(particles: Particle[]) {
        const count = 30 + Math.floor(Math.random() * 20); // antes 60-100
        for (let i = 0; i < count; i++)
          particles.push(new Particle(this.x, this.y, this.color));
        const color2 = COLORS[Math.floor(Math.random() * COLORS.length)];
        for (
          let i = 0;
          i < 8;
          i++ // antes 15-20
        )
          particles.push(new Particle(this.x, this.y, color2));
      }
    }

    let rockets: Rocket[] = [];
    let particles: Particle[] = [];
    let animId: number;

    const interval = setInterval(() => {
      if (particles.length < 150) {
        // máximo 150 partículas activas
        rockets.push(new Rocket());
      }
    }, 900);
    setTimeout(() => rockets.push(new Rocket()), 100);
    setTimeout(() => rockets.push(new Rocket()), 500);

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rockets = rockets.filter((r) => {
        r.update();
        r.draw();
        if (r.exploded) {
          r.explode(particles);
          return false;
        }
        return true;
      });
      particles = particles.filter((p) => {
        p.update();
        p.draw();
        return p.alpha > 0;
      });

      animId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [containerRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
