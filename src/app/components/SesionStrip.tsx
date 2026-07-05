"use client";
// src/app/components/SesionStrip.tsx
//
// Componente compartido de navegación de sesión.
// Reemplaza la lógica duplicada que existía en /mis-pronosticos y en
// QuinielaNav.tsx. Úsalo en cualquier pantalla donde el participante ya
// tenga folio cargado (fase/[orden], mis-pronosticos, general, etc).
//
// NOTA: QuinielaNav.tsx (dentro de /general) también reimplementa este
// patrón por separado — no lo migré aquí porque no tengo ese archivo en
// este contexto. Sigue siendo una segunda fuente de verdad hasta que se
// actualice para usar este mismo componente.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParticipante } from "../hooks/useParticipante";

interface SesionStripProps {
  /** Ruta del botón "Resultados del día". Default: /general */
  resultadosHref?: string;
  /** Texto del botón de navegación secundaria. Default: "Resultados del día" */
  resultadosLabel?: string;
}

export function SesionStrip({
  resultadosHref = "/general",
  resultadosLabel = "Resultados del día",
}: SesionStripProps) {
  const router = useRouter();
  const { participante, limpiar } = useParticipante();
  const [confirmarSalida, setConfirmarSalida] = useState(false);

  // Si por lo que sea no hay participante cargado, no mostramos el strip
  // (evita folio undefined en el modal).
  if (!participante) return null;

  function cerrarSesion() {
    limpiar();
    router.replace("/");
  }

  return (
    <>
      {confirmarSalida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmarSalida(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white rounded-xl border border-gray-200 shadow-2xl p-6 text-center">
            <p className="text-2xl mb-3">🚪</p>
            <h3 className="text-sm text-[#031D2D] uppercase tracking-widest font-black mb-2">
              ¿Cerrar sesión?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-5">
              Tu folio{" "}
              <span className="font-bold text-[#031D2D]">
                {participante.folio}
              </span>{" "}
              se eliminará de este dispositivo. Puedes recuperarlo con tu
              teléfono y fecha de nacimiento.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmarSalida(false)}
                className="flex-1 py-2.5 text-xs font-bold tracking-wide uppercase rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={cerrarSesion}
                className="flex-1 py-2.5 text-xs font-bold tracking-wide uppercase rounded-lg bg-[#8D0302] hover:bg-[#b52222] text-white transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full bg-[#8D0302] rounded-xl px-4 py-2.5 flex items-center justify-between mb-6 shadow-md">
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
        <a
          href={resultadosHref}
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
          {resultadosLabel}
        </a>
      </div>
    </>
  );
}
