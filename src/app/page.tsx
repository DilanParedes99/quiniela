"use client";

import { useEffect, useState } from "react";
import Confetti from "../app/components/confeti";
import AnimatedTitle from "../app/components/AnimatedTitle";

import Link from "next/link";
import Image from "next/image";
const TARGET = new Date("2026-06-11T13:00:00-06:00");

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: pad(diff / 864e5),
    hours: pad((diff % 864e5) / 36e5),
    mins: pad((diff % 36e5) / 6e4),
    secs: pad((diff % 6e4) / 1e3),
  };
}

export default function Home() {
  // ✅ null en el servidor, nunca toca Date.now() en SSR
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    // Solo se ejecuta en el cliente
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const units = [
    { id: "days", label: "Días", value: time?.days },
    { id: "hours", label: "Horas", value: time?.hours },
    { id: "mins", label: "Min", value: time?.mins },
    { id: "secs", label: "Seg", value: time?.secs },
  ];

  return (
    <div className="hero-bg min-h-screen flex flex-col items-center bg-[#E6E6E6] relative">
      <Confetti />

      {/* Contenido central */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        <div className="text-center">
          {/* PNG pegado al fondo */}

          <AnimatedTitle />
          <div className="w-full flex justify-center mt-auto">
            <Image
              src="/mpa2.png"
              alt="MarcoPolo juega en equipo"
              width={320}
              height={200}
              className=""
            />
          </div>
          {time === null ? (
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-6">
              {units.map(({ id, label }) => (
                <div
                  key={id}
                  className="bg-white rounded-xl border border-gray-200 pt-4 pb-3 px-2"
                >
                  <span className="block text-5xl font-extrabold text-gray-300 leading-none mb-1">
                    --
                  </span>
                  <span className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          ) : time ? (
            <>
              <p className="text-xs font-semibold tracking-widest text-[#031D2D] uppercase mb-4">
                México vs Sudáfrica · Estadio Banorte · 11 jun 2026
              </p>
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-10">
                {units.map(({ id, label, value }) => (
                  <div
                    key={id}
                    className="bg-white rounded-xl border border-gray-200 pt-4 pb-3 px-2"
                  >
                    <span className="block text-5xl font-extrabold text-gray-900 leading-none mb-1 tabular-nums">
                      {value}
                    </span>
                    <span className="text-[11px] font-semibold tracking-widest text-[#031D2D] uppercase">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/juego"
                className="inline-flex items-center gap-2 bg-[#8D0302] hover:bg-[#6e0202] transition-colors rounded-full px-6 py-2.5 text-sm font-bold text-white tracking-wide uppercase"
              >
                registrate
              </Link>
            </>
          ) : (
            <p className="text-green-600 font-bold text-2xl tracking-wide">
              ¡Ya comenzó!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
