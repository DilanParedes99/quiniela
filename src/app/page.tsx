"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "./components/confeti";
import AnimatedTitle from "./components/AnimatedTitle";
import Link from "next/link";
import Image from "next/image";
import { useParticipante } from "./hooks/useParticipante";

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

  // Si ya tiene folio en localStorage y el mundial ya empezó,
  // busca la fase activa y redirige directo
  useEffect(() => {
    if (!cargado || !participante || time !== null) return;
    fetch("/api/fases/activa")
      .then((r) => r.json())
      .then((data) => {
        if (data.fase) router.replace(`/fase/${data.fase.orden}`);
      })
      .catch(() => {});
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
      // 1. Verificar que el folio existe
      const resVerificar = await fetch("/api/participantes/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folio: folioLimpio }),
      });
      const dataVerificar = await resVerificar.json();

      if (!resVerificar.ok) {
        setErrorFolio(dataVerificar.error ?? "Folio no encontrado.");
        return;
      }

      // 2. Guardar en localStorage
      guardar({ folio: dataVerificar.folio, nombre: dataVerificar.nombre });

      // 3. Buscar fase activa y redirigir
      const resFase = await fetch("/api/fases/activa");
      const dataFase = await resFase.json();

      if (dataFase.fase) {
        router.push(`/fase/${dataFase.fase.orden}`);
      } else {
        // No hay fase abierta — folio guardado, mensaje informativo
        setErrorFolio(
          `¡Listo, ${dataVerificar.nombre.split(" ")[0]}! Tu folio está guardado. Las fases abren pronto.`,
        );
      }
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

  const esMensajeExito = errorFolio.startsWith("¡Listo");

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

          {!cargado ? null : time !== null ? (
            <>
              {/* ── COUNTDOWN ACTIVO ── */}
              <p className="text-xs font-semibold tracking-widest text-[#031D2D] uppercase mb-4">
                México vs Sudáfrica · Estadio Ciudad de México · 11 jun 2026
              </p>
              <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto mb-8">
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

              {/* Mismo bloque de acciones — countdown activo o no */}
              <AccionesBloque
                folio={folio}
                setFolio={setFolio}
                errorFolio={errorFolio}
                setErrorFolio={setErrorFolio}
                cargandoFolio={cargandoFolio}
                esMensajeExito={esMensajeExito}
                handleIngresarFolio={handleIngresarFolio}
              />
            </>
          ) : (
            <>
              {/* ── COUNTDOWN TERMINÓ ── */}
              <p className="text-sm font-semibold text-[#031D2D] uppercase tracking-widest mb-2">
                ¡El Mundial ya comenzó!
              </p>
              <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">
                Regístrate o ingresa tu folio para participar en la Quiniela
                Ciudadana.
              </p>

              <AccionesBloque
                folio={folio}
                setFolio={setFolio}
                errorFolio={errorFolio}
                setErrorFolio={setErrorFolio}
                cargandoFolio={cargandoFolio}
                esMensajeExito={esMensajeExito}
                handleIngresarFolio={handleIngresarFolio}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bloque de acciones: botón registro + input folio ─────────────────────────
// Aparece igual en ambos estados (con y sin countdown)
function AccionesBloque({
  folio,
  setFolio,
  errorFolio,
  setErrorFolio,
  cargandoFolio,
  esMensajeExito,
  handleIngresarFolio,
}: {
  folio: string;
  setFolio: (v: string) => void;
  errorFolio: string;
  setErrorFolio: (v: string) => void;
  cargandoFolio: boolean;
  esMensajeExito: boolean;
  handleIngresarFolio: (e: React.FormEvent) => void;
}) {
  return (
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
        <form onSubmit={handleIngresarFolio} className="flex flex-col gap-2">
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
                esMensajeExito ? "text-green-700 font-semibold" : "text-red-600"
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
      </div>
    </div>
  );
}
