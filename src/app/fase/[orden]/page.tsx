"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { useParticipante } from "../../hooks/useParticipante";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Fase {
  id: string;
  nombre: string;
  orden: number;
  estado: string;
  registro_abre_en: string;
  registro_cierra_en: string;
}

interface Partido {
  id: string;
  numero: number;
  equipo_local: string;
  equipo_visita: string;
  fecha_inicio: string | null;
  definido: boolean;
}

interface Pronostico {
  partido_id: string;
  goles_local: number | "";
  goles_visita: number | "";
}

// ─── Componente tarjeta de partido ───────────────────────────────────────────
function TarjetaPartido({
  partido,
  pronostico,
  onChange,
  enviado,
}: {
  partido: Partido;
  pronostico: Pronostico;
  onChange: (
    partido_id: string,
    campo: "goles_local" | "goles_visita",
    valor: number | "",
  ) => void;
  enviado: boolean;
}) {
  const inputClass =
    "w-14 h-14 text-center text-2xl font-extrabold border-2 rounded-xl bg-gray-50 text-[#031D2D] focus:outline-none focus:ring-2 focus:ring-[#8D0302] focus:border-transparent transition-colors tabular-nums";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="flex items-center justify-between gap-2">
        {/* Equipo local */}
        <div className="flex-1 text-right">
          <p className="text-sm font-extrabold text-[#031D2D] leading-tight">
            {partido.equipo_local}
          </p>
        </div>

        {/* Marcador */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={0}
            max={30}
            value={pronostico.goles_local}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : parseInt(e.target.value);
              onChange(partido.id, "goles_local", v);
            }}
            disabled={enviado}
            className={`${inputClass} ${
              pronostico.goles_local === ""
                ? "border-gray-300"
                : "border-[#8D0302]"
            } ${enviado ? "opacity-50 cursor-not-allowed" : ""}`}
            placeholder="0"
          />
          <span className="text-xl font-extrabold text-gray-400">—</span>
          <input
            type="number"
            min={0}
            max={30}
            value={pronostico.goles_visita}
            onChange={(e) => {
              const v = e.target.value === "" ? "" : parseInt(e.target.value);
              onChange(partido.id, "goles_visita", v);
            }}
            disabled={enviado}
            className={`${inputClass} ${
              pronostico.goles_visita === ""
                ? "border-gray-300"
                : "border-[#8D0302]"
            } ${enviado ? "opacity-50 cursor-not-allowed" : ""}`}
            placeholder="0"
          />
        </div>

        {/* Equipo visita */}
        <div className="flex-1 text-left">
          <p className="text-sm font-extrabold text-[#031D2D] leading-tight">
            {partido.equipo_visita}
          </p>
        </div>
      </div>

      {/* Fecha del partido */}
      {partido.fecha_inicio && (
        <p className="text-[10px] text-gray-400 text-center mt-2">
          {new Date(partido.fecha_inicio).toLocaleDateString("es-MX", {
            weekday: "short",
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Mexico_City",
          })}
        </p>
      )}
    </div>
  );
}

// ─── Pantalla de éxito ────────────────────────────────────────────────────────
function PantallaExito({ fase, nombre }: { fase: Fase; nombre: string }) {
  return (
    <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-xl border-4 border-[#8D0302] shadow-lg p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#8D0302] flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
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
        <h2
          className={`${montserrat.className} text-xl text-[#031D2D] uppercase tracking-widest mb-2`}
        >
          ¡Listo, {nombre.split(" ")[0]}!
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Tus pronósticos para{" "}
          <span className="font-bold text-[#031D2D]">{fase.nombre}</span> fueron
          enviados correctamente.
        </p>
        <div className="bg-[#F8F4B8] rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-600 leading-relaxed">
            Tu foto del calendario será revisada por el equipo. Una vez
            aprobada, tus puntos serán contabilizados al final de la fase.
          </p>
        </div>
        <a
          href="/rankings"
          className="block w-full py-3 text-sm font-extrabold tracking-widest uppercase rounded-lg bg-[#8D0302] hover:bg-[#b52222] text-white border-2 border-white transition-colors"
        >
          Ver tabla de posiciones →
        </a>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function FasePage() {
  const params = useParams();
  const router = useRouter();
  const { participante, cargado } = useParticipante();
  const orden = parseInt(params.orden as string);

  const [fase, setFase] = useState<Fase | null>(null);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [pronosticos, setPronosticos] = useState<Record<string, Pronostico>>(
    {},
  );
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [errorFoto, setErrorFoto] = useState("");
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Redirigir si no tiene folio ──────────────────────────────────────────
  useEffect(() => {
    if (!cargado) return;
    if (!participante) {
      router.replace("/");
    }
  }, [cargado, participante, router]);

  // ── Cargar fase y partidos ───────────────────────────────────────────────
  useEffect(() => {
    if (isNaN(orden)) return;
    setCargandoDatos(true);
    fetch(`/api/fases/${orden}/partidos`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErrorGeneral(data.error);
          return;
        }
        setFase(data.fase);
        setPartidos(data.partidos);

        // Inicializar pronósticos vacíos
        const init: Record<string, Pronostico> = {};
        for (const p of data.partidos) {
          init[p.id] = { partido_id: p.id, goles_local: "", goles_visita: "" };
        }
        setPronosticos(init);
      })
      .catch(() => setErrorGeneral("Error al cargar los partidos."))
      .finally(() => setCargandoDatos(false));
  }, [orden]);

  // ── Manejar cambio de foto ───────────────────────────────────────────────
  function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setErrorFoto("");
    if (!file) return;

    const tiposPermitidos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];
    if (!tiposPermitidos.includes(file.type)) {
      setErrorFoto("Solo se aceptan imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorFoto("La imagen no debe superar 10MB.");
      return;
    }

    setFoto(file);
    const url = URL.createObjectURL(file);
    setFotoPreview(url);
  }

  // ── Manejar cambio de pronóstico ─────────────────────────────────────────
  function handlePronostico(
    partido_id: string,
    campo: "goles_local" | "goles_visita",
    valor: number | "",
  ) {
    setPronosticos((prev) => ({
      ...prev,
      [partido_id]: { ...prev[partido_id], [campo]: valor },
    }));
  }

  // ── Validar antes de enviar ──────────────────────────────────────────────
  function validar(): string | null {
    for (const partido of partidos) {
      const p = pronosticos[partido.id];
      if (p.goles_local === "" || p.goles_visita === "") {
        return `Falta el marcador del partido ${partido.equipo_local} vs ${partido.equipo_visita}.`;
      }
    }
    if (!foto) return "Debes subir la foto de tu calendario.";
    return null;
  }

  // ── Enviar ───────────────────────────────────────────────────────────────
  async function handleEnviar() {
    setErrorEnvio("");
    const err = validar();
    if (err) {
      setErrorEnvio(err);
      return;
    }
    if (!participante) return;

    setEnviando(true);
    try {
      const pronosticosArray = Object.values(pronosticos).map((p) => ({
        partido_id: p.partido_id,
        goles_local: p.goles_local as number,
        goles_visita: p.goles_visita as number,
      }));

      const fd = new FormData();
      fd.append("foto", foto!);
      fd.append(
        "datos",
        JSON.stringify({
          folio: participante.folio,
          fase_orden: orden,
          pronosticos: pronosticosArray,
        }),
      );

      const res = await fetch("/api/pronosticos/crear", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorEnvio(data.error ?? "Error al enviar. Intenta de nuevo.");
        return;
      }

      setEnviado(true);
    } catch {
      setErrorEnvio(
        "Error de conexión. Verifica tu internet e intenta de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  }

  // ── Renders de estado ────────────────────────────────────────────────────
  if (!cargado || !participante) return null;

  if (enviado && fase) {
    return <PantallaExito fase={fase} nombre={participante.nombre} />;
  }

  if (cargandoDatos) {
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
            Cargando partidos…
          </p>
        </div>
      </div>
    );
  }

  if (errorGeneral) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-xl border-2 border-red-300 p-6 text-center">
          <p className="text-sm text-red-600 font-semibold mb-4">
            {errorGeneral}
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

  if (!fase) return null;

  // Fase no abierta
  if (fase.estado !== "abierta") {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
          <p className="text-2xl mb-3">⏳</p>
          <h2
            className={`${montserrat.className} text-lg text-[#031D2D] uppercase tracking-widest mb-2`}
          >
            {fase.nombre}
          </h2>
          <p className="text-sm text-gray-500">
            {fase.estado === "proxima"
              ? "Esta fase aún no está abierta."
              : "Esta fase ya cerró."}
          </p>
        </div>
      </div>
    );
  }

  // Sin partidos cargados todavía
  if (partidos.length === 0) {
    return (
      <div className="min-h-screen bg-[#E6E6E6] flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
          <p className="text-2xl mb-3">⚽</p>
          <h2
            className={`${montserrat.className} text-lg text-[#031D2D] uppercase tracking-widest mb-2`}
          >
            {fase.nombre}
          </h2>
          <p className="text-sm text-gray-500">
            Los partidos de esta fase aún no han sido definidos. Vuelve pronto.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E6E6E6] min-h-screen pb-12">
      {/* Header */}
      <div className="bg-[#031D2D] px-4 py-5 text-center">
        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-1">
          Quiniela Ciudadana MarcoPolo · Mundial 2026
        </p>
        <h1
          className={`${montserrat.className} text-2xl text-white uppercase tracking-widest`}
        >
          {fase.nombre}
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Hola,{" "}
          <span className="text-white font-bold">
            {participante.nombre.split(" ")[0]}
          </span>{" "}
          · <span className="text-[#F8F4B8]">{participante.folio}</span>
        </p>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* Instrucciones */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-[#031D2D] uppercase tracking-wide mb-2">
            ¿Cómo participar?
          </p>
          <ol className="space-y-1">
            {[
              "Ingresa el marcador que predices para cada partido",
              "Toma una foto de tu calendario con los pronósticos anotados",
              "Sube la foto y envía tus pronósticos",
            ].map((paso, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-[#8D0302] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-gray-600">{paso}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Partidos */}
        <div>
          <h2 className="text-xs font-bold text-[#031D2D] uppercase tracking-widest mb-3 px-1">
            Tus pronósticos
          </h2>
          <div className="space-y-3">
            {partidos.map((partido) => (
              <TarjetaPartido
                key={partido.id}
                partido={partido}
                pronostico={
                  pronosticos[partido.id] ?? {
                    partido_id: partido.id,
                    goles_local: "",
                    goles_visita: "",
                  }
                }
                onChange={handlePronostico}
                enviado={enviado}
              />
            ))}
          </div>
        </div>

        {/* Subir foto */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-bold text-[#031D2D] uppercase tracking-wide mb-1">
            Foto del calendario
          </p>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            Sube una foto legible de tu calendario con los pronósticos anotados.
            El equipo la revisará para validar tu participación.
          </p>

          {/* Preview */}
          {fotoPreview && (
            <div className="mb-3 relative">
              <Image
                src={fotoPreview}
                alt="Vista previa"
                width={400}
                height={200}
                className="w-full h-40 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => {
                  setFoto(null);
                  setFotoPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-600 transition-colors"
              >
                <svg
                  className="w-4 h-4"
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
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFoto}
            className="hidden"
            id="foto-input"
          />

          <label
            htmlFor="foto-input"
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg border-2 border-dashed cursor-pointer transition-colors text-sm font-bold tracking-wide uppercase ${
              foto
                ? "border-[#8D0302] text-[#8D0302] bg-red-50"
                : "border-gray-300 text-gray-500 bg-gray-50 hover:border-[#8D0302] hover:text-[#8D0302]"
            }`}
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
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {foto ? "Cambiar foto" : "Tomar o subir foto"}
          </label>

          {errorFoto && (
            <p className="mt-2 text-xs text-red-600">{errorFoto}</p>
          )}
        </div>

        {/* Error de envío */}
        {errorEnvio && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700 font-semibold">{errorEnvio}</p>
          </div>
        )}

        {/* Botón enviar */}
        <button
          onClick={handleEnviar}
          disabled={enviando}
          className={`w-full py-4 text-sm font-extrabold tracking-widest uppercase rounded-xl border-2 border-white transition-colors ${
            enviando
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-[#8D0302] hover:bg-[#b52222] text-white cursor-pointer"
          }`}
        >
          {enviando ? (
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
              Enviando…
            </span>
          ) : (
            "Enviar pronósticos →"
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Una vez enviados, tus pronósticos no podrán modificarse.
        </p>
      </div>
    </div>
  );
}
