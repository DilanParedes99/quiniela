"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "./components/confeti";
import AnimatedTitle from "./components/AnimatedTitle";
import Link from "next/link";
import Image from "next/image";
import { useParticipante } from "./hooks/useParticipante";

const TARGET = new Date("2026-06-11T13:00:00-06:00");

// ── INTERRUPTOR MANUAL ──────────────────────────────────────────────────────
// false: aunque el countdown llegue a 0, seguimos mostrando "Regístrate"
//        (registros de Octavos siguen abiertos, partidos no inician aún)
// true:  activa el bloque de "Ingresa tu folio" + redirección automática
//        a /fase/1 para quienes ya tienen folio guardado
const FASES_ABIERTAS = false;

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
  const router = useRouter();
  const { participante, guardar, cargado } = useParticipante();
  const [time, setTime] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  const [folio, setFolio] = useState("");
  const [errorFolio, setErrorFolio] = useState("");
  const [cargandoFolio, setCargandoFolio] = useState(false);

  useEffect(() => {
    setTime(getTimeLeft());
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  // Solo redirige automáticamente a fase activa si FASES_ABIERTAS está activo
  useEffect(() => {
    if (!cargado || !FASES_ABIERTAS) return;
    if (participante && time === null) {
      router.replace("/fase/1");
    }
  }, [cargado, participante, time, router]);

  async function handleIngresarFolio(e: React.FormEvent) {
    e.preventDefault();
    setErrorFolio("");
    const folioLimpio = folio.trim().toUpperCase();
    if (!/^MJ-[A-Z2-9]{4}$/.test(folioLimpio)) {
      setErrorFolio("Formato inválido. Ej: MJ-AB3K");
      return;
    }
    setCargandoFolio(true);
    try {
      const res = await fetch("/api/participantes/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folio: folioLimpio }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorFolio(data.error ?? "Folio no encontrado.");
        return;
      }
      guardar({ folio: data.folio, nombre: data.nombre });
      router.push("/fase/1");
    } catch {
      setErrorFolio("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargandoFolio(false);
    }
  }

  const units = [
    { id: "days", label: "Días", value: time?.days },
    { id: "hours", label: "Horas", value: time?.hours },
    { id: "mins", label: "Min", value: time?.mins },
    { id: "secs", label: "Seg", value: time?.secs },
  ];

  // Mostrar countdown solo si aún no llega a cero
  const mostrarCountdown = time !== null;

  return (
    <div className="hero-bg min-h-screen flex flex-col items-center bg-[#E6E6E6] relative">
      <Confetti />

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

          {!cargado ? null : !mostrarCountdown && !FASES_ABIERTAS ? (
            // ── Countdown llegó a 0 pero las fases aún no abren: seguimos en modo registro ──
            <>
              <p className="text-sm font-semibold text-[#031D2D] uppercase tracking-widest mb-6">
                ¡El Mundial ya comenzó!
              </p>
              <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                Regístrate para participar en la Quiniela Ciudadana. Las fases
                se irán habilitando conforme avance el torneo.
              </p>
              <Link
                href="/quiniela"
                className="inline-flex items-center gap-2 bg-[#8D0302] hover:bg-[#6e0202] transition-colors rounded-full px-6 py-2.5 text-sm font-bold text-white tracking-wide uppercase"
              >
                Regístrate
              </Link>
            </>
          ) : mostrarCountdown ? (
            <>
              {/* ── ANTES DEL MUNDIAL: countdown + botón registrarse ── */}
              <p className="text-xs font-semibold tracking-widest text-[#031D2D] uppercase mb-4">
                México vs Sudáfrica <br />· Estadio Ciudad de México · <br />
                11 jun 2026
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
                href="/quiniela"
                className="inline-flex items-center gap-2 bg-[#8D0302] hover:bg-[#6e0202] transition-colors rounded-full px-6 py-2.5 text-sm font-bold text-white tracking-wide uppercase"
              >
                Regístrate
              </Link>
            </>
          ) : (
            <>
              {/* ── FASES_ABIERTAS = true: botón + input folio ── */}
              <p className="text-sm font-semibold text-[#031D2D] uppercase tracking-widest mb-6">
                ¡El Mundial ya comenzó! Participa ahora
              </p>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                <Link
                  href="/quiniela"
                  className="w-full text-center bg-[#8D0302] hover:bg-[#6e0202] transition-colors rounded-full px-6 py-3 text-sm font-bold text-white tracking-wide uppercase"
                >
                  Regístrate gratis
                </Link>

                <div className="relative">
                  <p className="text-xs text-gray-500 text-center mb-2">
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
                      <p className="text-xs text-red-600 text-center">
                        {errorFolio}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={cargandoFolio}
                      className="w-full bg-white border-2 border-[#8D0302] text-[#8D0302] hover:bg-[#8D0302] hover:text-white transition-colors rounded-full px-6 py-2.5 text-sm font-bold tracking-wide uppercase"
                    >
                      {cargandoFolio ? "Verificando…" : "Ingresar con folio"}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
