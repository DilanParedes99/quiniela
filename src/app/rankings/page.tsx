"use client";
// src/app/rankings/page.tsx
//
// Tabla pública Top 20 — no requiere folio.
// Se actualiza cuando el admin ejecuta calificar_fase() en Supabase.

import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

interface EntradaRanking {
  posicion_acumulada: number;
  nombre_participante: string;
  puntaje_total: number;
}

// ─── Medalla por posición ─────────────────────────────────────────────────────
function Medalla({ posicion }: { posicion: number }) {
  if (posicion === 1) return <span className="text-xl">🥇</span>;
  if (posicion === 2) return <span className="text-xl">🥈</span>;
  if (posicion === 3) return <span className="text-xl">🥉</span>;
  return (
    <span
      className={`${montserrat.className} text-sm font-black text-gray-400 w-6 text-center`}
    >
      {posicion}
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function RankingsPage() {
  const [ranking, setRanking] = useState<EntradaRanking[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/rankings/acumulado")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setRanking(data.ranking);
      })
      .catch(() => setError("Error de conexión. Intenta de nuevo."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="bg-[#E6E6E6] min-h-screen pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        {/* Header — mismo estilo que /general y /mis-pronosticos */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-[2px] w-16 bg-gray-400" />
            <span
              className={`${montserrat.className} text-xs font-bold tracking-widest uppercase text-gray-500`}
            >
              Mundial 2026
            </span>
            <div className="h-[2px] w-16 bg-gray-400" />
          </div>
          <h1
            className={`${montserrat.className} text-2xl font-black text-[#8D0302] leading-tight`}
          >
            TABLA DE POSICIONES
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Quiniela Ciudadana MarcoPolo · Top 20
          </p>
        </div>

        {/* Navegación */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/general"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-500 hover:text-[#031D2D] transition-colors"
          ></a>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Puntaje acumulado · máx 30 pts
          </p>
        </div>

        {/* Loading */}
        {cargando && (
          <div className="flex flex-col items-center gap-3 py-16">
            <svg
              className="animate-spin h-8 w-8 text-[#8D0302]"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <p className="text-sm text-gray-400 tracking-wide">
              Cargando ranking…
            </p>
          </div>
        )}

        {/* Error */}
        {!cargando && error && (
          <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
        )}

        {/* Sin datos */}
        {!cargando && !error && ranking.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-3xl mb-3">⚽</p>
            <h2
              className={`${montserrat.className} text-lg text-[#031D2D] uppercase tracking-widest mb-2`}
            >
              Próximamente
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              El ranking se publicará una vez que se califique la primera fase.
            </p>
          </div>
        )}

        {/* Tabla de posiciones */}
        {!cargando && !error && ranking.length > 0 && (
          <div className="space-y-2">
            {/* Top 3 destacado */}
            {ranking.slice(0, 3).map((entrada) => (
              <div
                key={`${entrada.posicion_acumulada}-${entrada.nombre_participante}`}
                className={`bg-white rounded-xl border shadow-sm px-4 py-3 flex items-center gap-4 ${
                  entrada.posicion_acumulada === 1
                    ? "border-yellow-300 bg-yellow-50/40"
                    : entrada.posicion_acumulada === 2
                      ? "border-gray-300 bg-gray-50/40"
                      : "border-orange-200 bg-orange-50/30"
                }`}
              >
                <div className="w-8 flex justify-center shrink-0">
                  <Medalla posicion={entrada.posicion_acumulada} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`${montserrat.className} text-sm font-black text-[#031D2D] truncate`}
                  >
                    {entrada.nombre_participante}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`${montserrat.className} text-xl font-black text-[#8D0302]`}
                  >
                    {entrada.puntaje_total}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                    pts
                  </p>
                </div>
              </div>
            ))}

            {/* Divisor */}
            {ranking.length > 3 && (
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Top 20
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            {/* Posiciones 4-20 */}
            {ranking.slice(3).map((entrada) => (
              <div
                key={`${entrada.posicion_acumulada}-${entrada.nombre_participante}`}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center gap-4"
              >
                <div className="w-8 flex justify-center shrink-0">
                  <Medalla posicion={entrada.posicion_acumulada} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#031D2D] truncate">
                    {entrada.nombre_participante}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p
                    className={`${montserrat.className} text-lg font-black text-[#031D2D]`}
                  >
                    {entrada.puntaje_total}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-wide">
                    pts
                  </p>
                </div>
              </div>
            ))}

            {/* Nota al pie */}
            <p className="text-[10px] text-gray-400 text-center pt-4 pb-2 leading-relaxed">
              El ranking se actualiza conforme avanzan las fases del torneo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
