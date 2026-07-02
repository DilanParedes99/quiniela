"use client";
// src/app/components/RecuperarFolioModal.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { useParticipante } from "../hooks/useParticipante";
import {
  obtenerEstado,
  decidirDestino,
  type EstadoParticipante,
} from "@/lib/navegacion";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

interface Props {
  onClose: () => void;
}

type Paso = "formulario" | "encontrado";

export default function RecuperarFolioModal({ onClose }: Props) {
  const router = useRouter();
  const { guardar } = useParticipante();

  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(false);
  const [continuando, setContinuando] = useState(false);
  const [error, setError] = useState("");
  const [paso, setPaso] = useState<Paso>("formulario");
  const [estado, setEstado] = useState<EstadoParticipante | null>(null);
  const [sinFaseActiva, setSinFaseActiva] = useState(false);

  async function handleBuscar() {
    setError("");

    if (!/^[0-9]{10}$/.test(telefono.replace(/\s/g, ""))) {
      setError("Ingresa un teléfono de 10 dígitos.");
      return;
    }
    if (!fecha) {
      setError("Ingresa tu fecha de nacimiento.");
      return;
    }

    setCargando(true);
    try {
      // Paso 1: buscar por teléfono + fecha de nacimiento
      const resBuscar = await fetch("/api/participantes/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: telefono.replace(/\s/g, ""),
          fecha_nacimiento: fecha,
        }),
      });
      const dataBuscar = await resBuscar.json();

      if (!resBuscar.ok) {
        setError(dataBuscar.error ?? "No encontramos tu registro.");
        return;
      }

      // Paso 2: obtener estado completo
      const estadoCompleto = await obtenerEstado(dataBuscar.folio);

      // Guardar en localStorage
      guardar({ folio: estadoCompleto.folio, nombre: estadoCompleto.nombre });
      setEstado(estadoCompleto);

      const destino = decidirDestino(estadoCompleto);
      setSinFaseActiva(destino === "/");

      setPaso("encontrado");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error de conexión. Intenta de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }

  async function handleContinuar() {
    if (!estado) return;
    const destino = decidirDestino(estado);

    if (destino === "/") {
      // No hay fase activa — simplemente cerrar el modal
      onClose();
      return;
    }

    setContinuando(true);
    try {
      router.push(destino);
    } finally {
      setContinuando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay — solo cierra en paso formulario, no cuando ya encontró */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={paso === "formulario" ? onClose : undefined}
      />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl border-4 border-[#8D0302] shadow-2xl p-6">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* ── Paso 1: formulario ── */}
        {paso === "formulario" && (
          <>
            <h3
              className={`${montserrat.className} text-base text-[#031D2D] uppercase tracking-widest mb-1`}
            >
              Recuperar folio
            </h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Ingresa el número con el que te registraste y tu fecha de
              nacimiento.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#031D2D] mb-1 uppercase tracking-wide">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => {
                    setTelefono(e.target.value);
                    setError("");
                  }}
                  placeholder="4430000000"
                  maxLength={10}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#031D2D] mb-1 uppercase tracking-wide">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => {
                    setFecha(e.target.value);
                    setError("");
                  }}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent cursor-pointer"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 font-semibold">{error}</p>
              )}

              <button
                onClick={handleBuscar}
                disabled={cargando}
                className={`w-full py-2.5 text-sm font-extrabold tracking-widest uppercase rounded-lg border-2 border-white transition-colors ${
                  cargando
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#8D0302] hover:bg-[#b52222] text-white cursor-pointer"
                }`}
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Buscando…
                  </span>
                ) : (
                  "Buscar mi folio"
                )}
              </button>
            </div>
          </>
        )}

        {/* ── Paso 2: folio encontrado ── */}
        {paso === "encontrado" && estado && (
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#8D0302] flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3
              className={`${montserrat.className} text-base text-[#031D2D] uppercase tracking-widest mb-1`}
            >
              ¡Aquí está tu folio!
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Hola,{" "}
              <span className="font-bold text-[#031D2D]">
                {estado.nombre.split(" ")[0]}
              </span>
            </p>

            {/* Folio destacado */}
            <div className="bg-[#F8F4B8] border-2 border-dashed border-[#8D0302] rounded-xl p-5 mb-4">
              <p className="text-xs font-bold text-[#8D0302] uppercase tracking-widest mb-2">
                Tu folio de participación
              </p>
              <p
                className={`${montserrat.className} text-4xl text-[#031D2D] tracking-[0.2em] mb-2`}
              >
                {estado.folio}
              </p>
              <p className="text-xs text-gray-500">
                Guárdalo para las siguientes fases.
              </p>
            </div>

            {/* Contexto de destino */}
            {sinFaseActiva ? (
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Tu folio está guardado. No hay fases activas por el momento.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                {estado.ya_participo
                  ? "Ya enviaste tus pronósticos en la fase activa. Puedes ver tu participación."
                  : "La fase activa está abierta. Puedes registrar tus pronósticos ahora."}
              </p>
            )}

            {/* Botón continuar — el usuario decide cuándo avanzar */}
            <button
              onClick={handleContinuar}
              disabled={continuando}
              className={`w-full py-3 text-sm font-extrabold tracking-widest uppercase rounded-lg border-2 border-white transition-colors mb-2 ${
                continuando
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[#8D0302] hover:bg-[#b52222] text-white cursor-pointer"
              }`}
            >
              {continuando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
                  Cargando…
                </span>
              ) : sinFaseActiva ? (
                "Cerrar"
              ) : (
                "Continuar →"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
