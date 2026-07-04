"use client";
// src/app/mis-pronosticos/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { useParticipante } from "../hooks/useParticipante";
import type {
  RespuestaMisPronosticos,
  FaseConPronosticos,
  PronosticoItem,
} from "../api/mis-pronosticos/route";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

// ─── Utilidades ───────────────────────────────────────────────────────────────
function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
}

function etiquetaPuntos(pronostico: PronosticoItem): {
  texto: string;
  color: string;
} {
  // Fase no calificada aún
  if (pronostico.puntos_obtenidos === null) {
    return { texto: "Pendiente", color: "text-gray-400" };
  }
  if (pronostico.puntos_obtenidos === 2) {
    return { texto: "+2 pts", color: "text-green-600" };
  }
  if (pronostico.puntos_obtenidos === 1) {
    return { texto: "+1 pt", color: "text-yellow-600" };
  }
  return { texto: "0 pts", color: "text-red-500" };
}

function etiquetaFoto(estado: string): { texto: string; color: string } {
  if (estado === "aprobada")
    return { texto: "Foto aprobada", color: "text-green-600" };
  if (estado === "rechazada")
    return { texto: "Foto rechazada", color: "text-red-600" };
  return { texto: "Foto en revisión", color: "text-yellow-600" };
}

// ─── Tarjeta de pronóstico ────────────────────────────────────────────────────
function TarjetaPronostico({ pro }: { pro: PronosticoItem }) {
  const { texto: textoPuntos, color: colorPuntos } = etiquetaPuntos(pro);
  const tieneResultado =
    pro.resultado_local !== null && pro.resultado_visita !== null;
  const calificado = pro.puntos_obtenidos !== null;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm p-4 ${
        calificado
          ? pro.puntos_obtenidos === 2
            ? "border-green-200"
            : pro.puntos_obtenidos === 1
              ? "border-yellow-200"
              : "border-red-100"
          : "border-gray-200"
      }`}
    >
      {/* Equipos */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-sm font-extrabold text-[#031D2D] text-right flex-1 leading-tight">
          {pro.equipo_local}
        </p>
        <span className="text-xs font-bold text-gray-400 shrink-0">vs</span>
        <p className="text-sm font-extrabold text-[#031D2D] text-left flex-1 leading-tight">
          {pro.equipo_visita}
        </p>
      </div>

      {/* Pronóstico vs Resultado */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mi pronóstico */}
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            Mi pronóstico
          </p>
          <p className={`${montserrat.className} text-2xl text-[#031D2D]`}>
            {pro.goles_local_predichos} — {pro.goles_visita_predichos}
          </p>
        </div>

        {/* Resultado real */}
        <div
          className={`rounded-lg p-3 text-center ${
            tieneResultado ? "bg-gray-50" : "bg-gray-50/50"
          }`}
        >
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
            Resultado
          </p>
          {tieneResultado ? (
            <p className={`${montserrat.className} text-2xl text-[#031D2D]`}>
              {pro.resultado_local} — {pro.resultado_visita}
            </p>
          ) : (
            <p className="text-sm text-gray-300 font-bold mt-1">—</p>
          )}
        </div>
      </div>

      {/* Footer: fecha + puntos */}
      <div className="flex items-center justify-between mt-3">
        {pro.fecha_inicio ? (
          <p className="text-[10px] text-gray-400">
            {formatFecha(pro.fecha_inicio)}
          </p>
        ) : (
          <span />
        )}
        <span
          className={`text-xs font-extrabold uppercase tracking-wide ${colorPuntos}`}
        >
          {textoPuntos}
        </span>
      </div>
    </div>
  );
}

// ─── Tab de fase ──────────────────────────────────────────────────────────────
function TabFase({ fase }: { fase: FaseConPronosticos }) {
  const { texto: textoFoto, color: colorFoto } = etiquetaFoto(fase.foto_estado);
  const faseCalificada = fase.estado_fase === "calificada";

  return (
    <div className="space-y-4">
      {/* Resumen de fase */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Participación enviada
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {formatFecha(fase.enviado_en)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">
              Puntaje
            </p>
            {faseCalificada ? (
              <p className={`${montserrat.className} text-2xl text-[#8D0302]`}>
                {fase.puntaje_fase}
                <span className="text-xs text-gray-400 ml-1">
                  / {fase.puntos_maximos_fase}
                </span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 font-semibold">Pendiente</p>
            )}
          </div>
        </div>

        {/* Estado de foto */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              fase.foto_estado === "aprobada"
                ? "bg-green-500"
                : fase.foto_estado === "rechazada"
                  ? "bg-red-500"
                  : "bg-yellow-400"
            }`}
          />
          <p className={`text-xs font-semibold ${colorFoto}`}>{textoFoto}</p>
        </div>
      </div>

      {/* Pronósticos */}
      <div className="space-y-3">
        {fase.pronosticos.map((pro) => (
          <TarjetaPronostico key={pro.partido_id} pro={pro} />
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function MisPronosticosPage() {
  const router = useRouter();
  const { participante, cargado, limpiar } = useParticipante();

  const [datos, setDatos] = useState<RespuestaMisPronosticos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [tabActiva, setTabActiva] = useState(0);
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  // Redirigir si no hay folio en localStorage
  useEffect(() => {
    if (!cargado) return;
    if (!participante) router.replace("/");
  }, [cargado, participante, router]);

  // Cargar pronósticos
  useEffect(() => {
    if (!cargado || !participante) return;
    setCargando(true);

    fetch("/api/mis-pronosticos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folio: participante.folio }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setDatos(data);
        // Tab activa = última fase en que participó
        setTabActiva((data as RespuestaMisPronosticos).fases.length - 1);
      })
      .catch(() => setError("Error de conexión. Intenta de nuevo."))
      .finally(() => setCargando(false));
  }, [cargado, participante]);

  function cerrarSesion() {
    limpiar(); // borra localStorage
    router.replace("/");
  }

  if (!cargado || !participante) return null;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
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
          <p className="text-sm font-semibold text-[#031D2D] tracking-wide">
            Cargando tus pronósticos…
          </p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !datos) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-xl border-2 border-red-200 p-6 text-center">
          <p className="text-sm text-red-600 font-semibold mb-4">
            {error || "No encontramos tus pronósticos."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-[#8D0302] hover:underline font-bold"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ── Sin pronósticos todavía ───────────────────────────────────────────────
  if (datos.fases.length === 0) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
          <p className="text-3xl mb-3">⚽</p>
          <h2
            className={`${montserrat.className} text-lg text-[#031D2D] uppercase tracking-widest mb-2`}
          >
            Aún no participas
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Todavía no has enviado pronósticos en ninguna fase.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 text-sm font-extrabold tracking-widest uppercase rounded-lg bg-[#8D0302] hover:bg-[#b52222] text-white border-2 border-white transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const faseActual = datos.fases[tabActiva];

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="bg-[#E6E6E6] min-h-screen pb-12">
      {/* Modal confirmación de cierre de sesión */}
      {confirmarSalida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmarSalida(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white rounded-xl border-2 border-gray-200 shadow-2xl p-6 text-center">
            <p className="text-2xl mb-3">🚪</p>
            <h3
              className={`${montserrat.className} text-sm text-[#031D2D] uppercase tracking-widest mb-2`}
            >
              ¿Cerrar sesión?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Tu folio{" "}
              <span className="font-bold text-[#031D2D]">{datos.folio}</span> se
              eliminará de este dispositivo. Puedes recuperarlo en cualquier
              momento con tu teléfono y fecha de nacimiento.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmarSalida(false)}
                className="flex-1 py-2.5 text-xs font-bold tracking-wide uppercase rounded-lg border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={cerrarSesion}
                className="flex-1 py-2.5 text-xs font-bold tracking-wide uppercase rounded-lg bg-[#8D0302] hover:bg-[#b52222] text-white border-2 border-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-[#031D2D] px-4 py-5">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1 text-center">
          Quiniela Ciudadana MarcoPolo · Mundial 2026
        </p>
        <h1
          className={`${montserrat.className} text-xl text-white uppercase tracking-widest text-center`}
        >
          Mis pronósticos
        </h1>
        <p className="text-xs text-gray-400 mt-1 text-center">
          <span className="text-white font-bold">
            {datos.nombre.split(" ")[0]}
          </span>
          {" · "}
          <span className="text-[#F8F4B8]">{datos.folio}</span>
        </p>
      </div>

      {/* Nav strip — navegación secundaria, responsabilidad única */}
      <div className="bg-[#031D2D] border-t border-white/10 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setConfirmarSalida(true)}
          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-red-400 transition-colors"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Cerrar sesión
        </button>
        <a
          href="/general"
          className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Resultados del día
        </a>
      </div>

      {/* Puntaje total */}
      <div className="bg-[#8D0302] px-4 py-3 text-center">
        <p className="text-[10px] font-bold tracking-widest text-red-200 uppercase mb-1">
          Puntaje acumulado total
        </p>
        <p className={`${montserrat.className} text-3xl text-white`}>
          {datos.puntaje_total}
          <span className="text-sm text-red-200 ml-2">/ 30 pts</span>
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5">
        {/* Tabs por fase */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-5">
          {datos.fases.map((fase, i) => (
            <button
              key={fase.fase_id}
              onClick={() => setTabActiva(i)}
              className={`flex-1 py-2 px-1 text-[10px] font-extrabold tracking-wide uppercase rounded-lg transition-all ${
                tabActiva === i
                  ? "bg-[#8D0302] text-white"
                  : "text-gray-400 hover:text-[#031D2D]"
              }`}
            >
              {fase.nombre_fase.split(" ")[0]}
              {/* Badge de puntaje si ya está calificada */}
              {fase.estado_fase === "calificada" && (
                <span
                  className={`block text-[9px] mt-0.5 ${
                    tabActiva === i ? "text-red-200" : "text-gray-400"
                  }`}
                >
                  {fase.puntaje_fase} pts
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Contenido de la tab activa */}
        <TabFase fase={faseActual} />
      </div>
    </div>
  );
}
