"use client";
// src/app/rankings/page.tsx

import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

interface EntradaRanking {
  posicion: number;
  nombre: string;
  puntaje_total?: number;
  puntaje_fase?: number;
}

interface TabConfig {
  id: string;
  label: string;
  sublabel: string;
  orden?: number;
}

const TABS: TabConfig[] = [
  { id: "acumulado", label: "Total", sublabel: "30 pts máx" },
  { id: "fase-1", label: "8vos", sublabel: "Top 100", orden: 1 },
  { id: "fase-2", label: "4tos", sublabel: "Top 50", orden: 2 },
  { id: "fase-3", label: "Semis", sublabel: "Top 30", orden: 3 },
  { id: "fase-4", label: "Final", sublabel: "Top 20", orden: 4 },
];

function Medalla({ posicion }: { posicion: number }) {
  if (posicion === 1) return <span className="text-xl">🥇</span>;
  if (posicion === 2) return <span className="text-xl">🥈</span>;
  if (posicion === 3) return <span className="text-xl">🥉</span>;
  return (
    <span
      className={`${montserrat.className} text-sm font-black text-gray-400 w-6 text-center inline-block`}
    >
      {posicion}
    </span>
  );
}

function FilaRanking({
  entrada,
  esTop3,
}: {
  entrada: EntradaRanking;
  esTop3: boolean;
}) {
  const puntaje = entrada.puntaje_total ?? entrada.puntaje_fase ?? 0;
  return (
    <div
      className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-4 ${
        entrada.posicion === 1
          ? "border-yellow-300 bg-yellow-50/40"
          : entrada.posicion === 2
            ? "border-gray-300 bg-gray-50/40"
            : entrada.posicion === 3
              ? "border-orange-200 bg-orange-50/30"
              : "border-gray-200"
      }`}
    >
      <div className="w-8 flex justify-center shrink-0">
        <Medalla posicion={entrada.posicion} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`${esTop3 ? `${montserrat.className} font-black` : "font-bold"} text-sm text-[#031D2D] truncate`}
        >
          {entrada.nombre}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={`${montserrat.className} ${esTop3 ? "text-xl text-[#8D0302]" : "text-lg text-[#031D2D]"} font-black`}
        >
          {puntaje}
        </p>
        <p className="text-[9px] text-gray-400 uppercase tracking-wide">pts</p>
      </div>
    </div>
  );
}

function ListaRanking({ ranking }: { ranking: EntradaRanking[] }) {
  if (ranking.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-3xl mb-3">⚽</p>
        <h2
          className={`${montserrat.className} text-lg text-[#031D2D] uppercase tracking-widest mb-2`}
        >
          Próximamente
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          El ranking se publicará una vez que se califique esta fase.
        </p>
      </div>
    );
  }

  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);

  return (
    <div className="space-y-2">
      {top3.map((e) => (
        <FilaRanking key={`${e.posicion}-${e.nombre}`} entrada={e} esTop3 />
      ))}
      {resto.length > 0 && (
        <>
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {ranking.length} participantes
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {resto.map((e) => (
            <FilaRanking
              key={`${e.posicion}-${e.nombre}`}
              entrada={e}
              esTop3={false}
            />
          ))}
        </>
      )}
      <p className="text-[10px] text-gray-400 text-center pt-4 pb-2 leading-relaxed">
        En caso de empate, el desempate se resuelve en la siguiente fase.
      </p>
    </div>
  );
}

export default function RankingsPage() {
  const [tabActiva, setTabActiva] = useState("acumulado");
  const [ranking, setRanking] = useState<EntradaRanking[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCargando(true);
    setError("");
    setRanking([]);

    const tab = TABS.find((t) => t.id === tabActiva);
    const url =
      tab?.orden !== undefined
        ? `/api/rankings/fase?orden=${tab.orden}`
        : "/api/rankings/acumulado";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        const lista: EntradaRanking[] = (data.ranking ?? []).map(
          (row: Record<string, unknown>, idx: number) => ({
            posicion:
              (row.posicion as number) ??
              (row.posicion_acumulada as number) ??
              idx + 1,
            nombre:
              (row.nombre_participante as string) ??
              (row.nombre as string) ??
              "",
            puntaje_total: row.puntaje_total as number | undefined,
            puntaje_fase: row.puntaje_fase as number | undefined,
          }),
        );
        setRanking(lista);
      })
      .catch(() => setError("Error de conexión. Intenta de nuevo."))
      .finally(() => setCargando(false));
  }, [tabActiva]);

  const tabActual = TABS.find((t) => t.id === tabActiva)!;

  return (
    <div className="bg-[#E6E6E6] min-h-screen pb-12">
      <div className="max-w-2xl mx-auto px-4 pt-8">
        {/* Header */}
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
            Quiniela Ciudadana MarcoPolo
          </p>
        </div>

        {/* Nav */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            {tabActual.sublabel}
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 p-1 mb-5 flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex-1 py-2 px-1 rounded-lg transition-all shrink-0 ${
                tabActiva === tab.id
                  ? "bg-[#8D0302] text-white"
                  : "text-gray-400 hover:text-[#8D0302]"
              }`}
            >
              <p className="text-[10px] font-extrabold tracking-wide uppercase">
                {tab.label}
              </p>
              <p className="text-[9px] mt-0.5 text-gray-300">{tab.sublabel}</p>
            </button>
          ))}
        </div>

        {/* Contenido */}
        {cargando ? (
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
        ) : error ? (
          <div className="bg-white rounded-xl border border-red-200 p-6 text-center">
            <p className="text-sm text-red-600 font-semibold">{error}</p>
          </div>
        ) : (
          <ListaRanking ranking={ranking} />
        )}
      </div>
    </div>
  );
}
