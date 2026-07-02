"use client";
// src/app/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "./components/confeti";
import AnimatedTitle from "./components/AnimatedTitle";
import RecuperarFolioModal from "./components/RecuperarFolioModal";
import Link from "next/link";
import Image from "next/image";
import { useParticipante } from "./hooks/useParticipante";
import { obtenerEstado, decidirDestino } from "@/lib/navegacion";

export default function Home() {
  const router = useRouter();
  const { participante, guardar, cargado } = useParticipante();

  const [folio, setFolio] = useState("");
  const [errorFolio, setErrorFolio] = useState("");
  const [cargandoFolio, setCargandoFolio] = useState(false);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);

  // Bloquea la redirección automática mientras el usuario
  // está interactuando con el form manual o el modal
  const [interactuandoManual, setInteractuandoManual] = useState(false);

  // ── Folio en localStorage: redirección automática ─────────────────────────
  // Si el usuario ya tiene folio guardado, consultamos su estado
  // y lo mandamos al destino correcto sin que tenga que hacer nada.
  useEffect(() => {
    if (!cargado || !participante || interactuandoManual) return;

    obtenerEstado(participante.folio)
      .then((estado) => {
        const destino = decidirDestino(estado);
        if (destino !== "/") router.replace(destino);
      })
      .catch(() => {
        // Si el folio en localStorage ya no es válido (ej: borrado en BD),
        // no navegamos — el usuario ve la pantalla normal sin error visible.
        // El folio corrupto se limpiará la próxima vez que use el form.
      });
  }, [cargado, participante, interactuandoManual, router]);

  // ── Folio ingresado manualmente ───────────────────────────────────────────
  async function handleIngresarFolio(e: React.FormEvent) {
    e.preventDefault();
    setErrorFolio("");
    const folioLimpio = folio.trim().toUpperCase();

    if (!/^MJ-[A-Z2-9]{4}$/.test(folioLimpio)) {
      setErrorFolio("Formato inválido. Ej: MJ-AB3K");
      return;
    }

    setCargandoFolio(true);
    setInteractuandoManual(true);

    try {
      const estado = await obtenerEstado(folioLimpio);

      guardar({ folio: estado.folio, nombre: estado.nombre });

      const destino = decidirDestino(estado);

      if (destino === "/") {
        setErrorFolio(
          `¡Listo, ${estado.nombre.split(" ")[0]}! Tu folio está guardado. Las fases abren pronto.`,
        );
        setInteractuandoManual(false);
      } else {
        router.push(destino);
        // No reseteamos interactuandoManual porque ya navegamos
      }
    } catch (err) {
      setErrorFolio(
        err instanceof Error
          ? err.message
          : "Error de conexión. Intenta de nuevo.",
      );
      setInteractuandoManual(false);
    } finally {
      setCargandoFolio(false);
    }
  }

  const esMensajeExito = errorFolio.startsWith("¡Listo");

  // No renderizar hasta que localStorage haya cargado
  // Evita flash de contenido antes de la redirección automática
  if (!cargado) return null;

  return (
    <div className="hero-bg min-h-screen flex flex-col items-center bg-[#E6E6E6] relative">
      <Confetti />

      {mostrarRecuperar && (
        <RecuperarFolioModal
          onClose={() => {
            setMostrarRecuperar(false);
            setInteractuandoManual(false);
          }}
        />
      )}

      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        <div className="text-center px-4">
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

          <p className="text-sm font-semibold text-[#031D2D] uppercase tracking-widest mb-2">
            ¡El Mundial ya comenzó!
          </p>
          <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
            Regístrate o ingresa tu folio para participar en la Quiniela
            Ciudadana.
          </p>

          <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
            {/* Botón registro */}
            <Link
              href="/quiniela"
              className="w-full text-center bg-[#8D0302] hover:bg-[#6e0202] transition-colors rounded-full px-6 py-3 text-sm font-bold text-white tracking-wide uppercase"
            >
              Regístrate gratis
            </Link>

            {/* Separador */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-400 font-semibold">o</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Input folio */}
            <div>
              <p className="text-xs text-gray-500 text-center mb-2 font-semibold">
                ¿Ya tienes folio?
              </p>
              <form
                onSubmit={handleIngresarFolio}
                className="flex flex-col gap-2"
              >
                <input
                  type="text"
                  value={folio}
                  onChange={(e) => {
                    setFolio(e.target.value.toUpperCase());
                    setErrorFolio("");
                  }}
                  placeholder="MJ-XXXX"
                  maxLength={7}
                  className="w-full px-4 py-2.5 text-sm text-center font-bold tracking-widest border-2 border-[#8D0302] rounded-full bg-white text-[#031D2D] placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-700 uppercase"
                />
                {errorFolio && (
                  <p
                    className={`text-xs text-center px-2 leading-relaxed ${
                      esMensajeExito
                        ? "text-green-700 font-semibold"
                        : "text-red-600"
                    }`}
                  >
                    {errorFolio}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={cargandoFolio}
                  className={`w-full border-2 border-[#8D0302] rounded-full px-6 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors ${
                    cargandoFolio
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-[#8D0302] hover:bg-[#8D0302] hover:text-white cursor-pointer"
                  }`}
                >
                  {cargandoFolio ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
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
                      Verificando…
                    </span>
                  ) : (
                    "Ingresar con folio"
                  )}
                </button>
              </form>

              {/* Abre el modal directamente — sin navegación a /quiniela */}
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setInteractuandoManual(true);
                    setMostrarRecuperar(true);
                  }}
                  className="text-xs text-gray-400 hover:text-[#8D0302] transition-colors hover:underline"
                >
                  ¿Olvidaste tu folio?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
