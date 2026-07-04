"use client";
// src/app/components/QuinielaNav.tsx
//
// Client Component que vive dentro del Server Component /general.
// Responsabilidades únicas:
// 1. Mostrar las 4 fases de la quiniela con estado dinámico
// 2. Botón "Ir a fase activa" si el usuario tiene folio
// 3. Cerrar sesión con confirmación
// 4. Redirigir a / si no hay folio
//
// Accede a localStorage via useParticipante.
// Fetch a /api/fases/todas (lectura pública) y /api/participantes/estado.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { useParticipante } from "../hooks/useParticipante";
import { obtenerEstado, decidirDestino } from "@/lib/navegacion";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Fase {
  id: string;
  nombre: string;
  orden: number;
  estado: "proxima" | "abierta" | "cerrada" | "calificada";
  registro_abre_en: string;
  registro_cierra_en: string;
  puntos_maximos: number;
}

// ─── Utilidades ──────────────────────────────────────────────────────────────
function formatFechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    timeZone: "America/Mexico_City",
  });
}

function configFase(estado: Fase["estado"]): {
  etiqueta: string;
  colorEtiqueta: string;
  colorBorde: string;
  colorFondo: string;
  interactiva: boolean;
} {
  switch (estado) {
    case "abierta":
      return {
        etiqueta: "Abierta",
        colorEtiqueta: "text-green-700 bg-green-50 border-green-200",
        colorBorde: "border-[#8D0302]",
        colorFondo: "bg-white",
        interactiva: true,
      };
    case "proxima":
      return {
        etiqueta: "Próximamente",
        colorEtiqueta: "text-gray-400 bg-gray-50 border-gray-200",
        colorBorde: "border-gray-200",
        colorFondo: "bg-white opacity-60",
        interactiva: false,
      };
    case "cerrada":
      return {
        etiqueta: "Cerrada",
        colorEtiqueta: "text-red-600 bg-red-50 border-red-200",
        colorBorde: "border-gray-200",
        colorFondo: "bg-gray-50 opacity-70",
        interactiva: false,
      };
    case "calificada":
      return {
        etiqueta: "Calificada",
        colorEtiqueta: "text-blue-600 bg-blue-50 border-blue-200",
        colorBorde: "border-gray-200",
        colorFondo: "bg-gray-50 opacity-70",
        interactiva: false,
      };
  }
}

// ─── Modal de confirmación de cierre de sesión ───────────────────────────────
function ModalCerrarSesion({
  folio,
  onConfirmar,
  onCancelar,
}: {
  folio: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancelar}
      />
      <div className="relative z-10 w-full max-w-xs bg-white rounded-xl border-2 border-gray-200 shadow-2xl p-6 text-center">
        <p className="text-2xl mb-3">🚪</p>
        <h3
          className={`${montserrat.className} text-sm text-[#031D2D] uppercase tracking-widest mb-2`}
        >
          ¿Cerrar sesión?
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed mb-5">
          Tu folio <span className="font-bold text-[#031D2D]">{folio}</span> se
          eliminará de este dispositivo. Puedes recuperarlo en cualquier momento
          con tu teléfono y fecha de nacimiento.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 text-xs font-bold tracking-wide uppercase rounded-lg border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-2.5 text-xs font-bold tracking-wide uppercase rounded-lg bg-[#8D0302] hover:bg-[#b52222] text-white border-2 border-white transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function QuinielaNav() {
  const router = useRouter();
  const { participante, cargado, limpiar } = useParticipante();

  const [fases, setFases] = useState<Fase[]>([]);
  const [cargandoFases, setCargandoFases] = useState(true);
  const [cargandoFaseActiva, setCargandoFaseActiva] = useState(false);
  const [confirmarSalida, setConfirmarSalida] = useState(false);
  // Destino cacheado — se calcula una vez al montar, no en cada tap
  const [destinoFaseActiva, setDestinoFaseActiva] = useState<string | null>(
    null,
  );

  // Cargar fases desde Supabase via API Route
  useEffect(() => {
    fetch("/api/fases/todas")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setFases(data.fases);
      })
      .catch(() => {})
      .finally(() => setCargandoFases(false));
  }, []);

  // Precargar destino de la fase activa una sola vez al montar
  // Evita fetches múltiples por taps impacientes en mobile
  useEffect(() => {
    if (!participante) return;
    obtenerEstado(participante.folio)
      .then((estado) => {
        const destino = decidirDestino(estado);
        setDestinoFaseActiva(destino === "/" ? "/mis-pronosticos" : destino);
      })
      .catch(() => setDestinoFaseActiva(null));
  }, [participante]);

  function handleFaseActiva() {
    if (!participante) {
      router.push("/");
      return;
    }
    if (!destinoFaseActiva) {
      router.push("/");
      return;
    }
    setCargandoFaseActiva(true);
    router.push(destinoFaseActiva);
  }

  function cerrarSesion() {
    limpiar();
    router.replace("/");
  }

  const faseAbierta = fases.find((f) => f.estado === "abierta");

  // No renderizar hasta que localStorage haya hidratado
  // Evita flash de botones incorrectos en SSR
  if (!cargado) return null;

  return (
    <>
      {confirmarSalida && participante && (
        <ModalCerrarSesion
          folio={participante.folio}
          onConfirmar={cerrarSesion}
          onCancelar={() => setConfirmarSalida(false)}
        />
      )}

      <div className="mb-6">
        {/* Nav strip — solo visible si hay folio, solo acciones */}
        {participante && (
          <div className="w-full bg-[#031D2D] rounded-xl px-4 py-2.5 flex items-center justify-between mb-4 shadow-md">
            {/* Cerrar sesión — izquierda */}
            <button
              onClick={() => setConfirmarSalida(true)}
              className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-red-500/30 transition-colors rounded-full px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white hover:text-red-300"
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
            {/* Mis pronósticos — derecha */}
            <a
              href="/mis-pronosticos"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Mis pronósticos
            </a>
          </div>
        )}

        {/* Header sección fases */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <h2
              className={`${montserrat.className} text-xs font-black tracking-widest uppercase text-gray-500`}
            >
              🏆 Fases de la quiniela
            </h2>
            {/* Invitar a registrarse si no hay folio */}
            {!participante && (
              <a
                href="/"
                className="text-[10px] font-bold tracking-widest uppercase text-[#8D0302] hover:underline"
              >
                Regístrate →
              </a>
            )}
          </div>
          {/* Instrucción contextual */}
          <p className="text-[10px] text-gray-400 mt-1">
            {participante
              ? "Toca la fase activa para registrar o ver tus pronósticos."
              : "Regístrate para participar en cada fase del torneo."}
          </p>
        </div>

        {/* Lista de fases */}
        {cargandoFases ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 px-4 py-3 animate-pulse"
              >
                <div className="h-3 bg-gray-100 rounded w-32 mb-1" />
                <div className="h-2 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {fases.map((fase) => {
              const cfg = configFase(fase.estado);
              return (
                <div
                  key={fase.id}
                  onClick={
                    cfg.interactiva && participante
                      ? handleFaseActiva
                      : undefined
                  }
                  className={`rounded-xl border px-4 py-3 transition-all ${cfg.colorFondo} ${cfg.colorBorde} ${
                    cfg.interactiva && participante
                      ? "cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                      : cfg.interactiva
                        ? "cursor-default"
                        : "cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p
                          className={`${montserrat.className} text-sm font-black text-[#031D2D]`}
                        >
                          {fase.nombre}
                        </p>
                        <span
                          className={`text-[9px] font-bold border rounded-full px-2 py-0.5 ${cfg.colorEtiqueta}`}
                        >
                          {cfg.etiqueta}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {formatFechaCorta(fase.registro_abre_en)} —{" "}
                        {formatFechaCorta(fase.registro_cierra_en)} ·{" "}
                        {fase.puntos_maximos} pts máx
                      </p>
                    </div>
                    {/* Ícono de estado */}
                    <div className="shrink-0 ml-3">
                      {fase.estado === "abierta" && (
                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
                      )}
                      {fase.estado === "proxima" && (
                        <svg
                          className="w-4 h-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                      )}
                      {(fase.estado === "cerrada" ||
                        fase.estado === "calificada") && (
                        <svg
                          className="w-4 h-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
