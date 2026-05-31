"use client";
import Image from "next/image";
import Link from "next/link";
import Sparkless from "../components/Sparkles";
import { useRef, useState, type RefObject } from "react";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface FormData {
  nombre: string;
  telefono: string;
  fecha_nacimiento: string;
  correo: string;
  colonia: string;
  aceptaBases: boolean;
}

interface FormErrors {
  nombre?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  correo?: string;
  colonia?: string;
  aceptaBases?: string;
  general?: string;
}

interface RegistroExitoso {
  folio: string;
  nombre: string;
}

// ─── Utilidades ───────────────────────────────────────────────────────────────
function esMayorDeEdad(fechaStr: string): boolean {
  const nacimiento = new Date(fechaStr);
  const hoy = new Date();
  const cumpleEsteAnio = new Date(
    hoy.getFullYear(),
    nacimiento.getMonth(),
    nacimiento.getDate(),
  );
  const edad = hoy.getFullYear() - nacimiento.getFullYear();
  return edad > 18 || (edad === 18 && hoy >= cumpleEsteAnio);
}

// ─── Validación client-side ───────────────────────────────────────────────────
function validarCampos(data: FormData): FormErrors {
  const errores: FormErrors = {};

  if (!data.nombre.trim()) errores.nombre = "El nombre es requerido.";
  else if (data.nombre.trim().length < 3)
    errores.nombre = "Mínimo 3 caracteres.";
  else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(data.nombre))
    errores.nombre = "Solo letras y espacios.";

  if (!data.telefono) errores.telefono = "El teléfono es requerido.";
  else if (!/^[0-9]{10}$/.test(data.telefono.replace(/\s/g, "")))
    errores.telefono = "Debe tener 10 dígitos.";

  if (!data.fecha_nacimiento) {
    errores.fecha_nacimiento = "La fecha es requerida.";
  } else {
    const d = new Date(data.fecha_nacimiento);
    const minima = new Date("1900-01-01");
    if (d >= new Date()) errores.fecha_nacimiento = "Fecha inválida.";
    else if (d < minima) errores.fecha_nacimiento = "Fecha inválida.";
    else if (!esMayorDeEdad(data.fecha_nacimiento))
      errores.fecha_nacimiento =
        "Debes tener al menos 18 años para participar.";
  }

  if (data.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.correo))
    errores.correo = "Correo inválido.";

  if (!data.colonia.trim()) errores.colonia = "La colonia es requerida.";
  else if (data.colonia.trim().length < 5)
    errores.colonia = "Mínimo 5 caracteres.";

  if (!data.aceptaBases)
    errores.aceptaBases = "Debes aceptar las bases para continuar.";

  return errores;
}

// ─── Modal: Recuperar folio ───────────────────────────────────────────────────
function ModalRecuperarFolio({ onClose }: { onClose: () => void }) {
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] = useState<RegistroExitoso | null>(null);

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
      const res = await fetch("/api/participantes/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefono: telefono.replace(/\s/g, ""),
          fecha_nacimiento: fecha,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No encontramos tu registro.");
        return;
      }
      setResultado({ folio: data.folio, nombre: data.nombre });
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-xl border-4 border-[#8D0302] shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
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

        {!resultado ? (
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
                {cargando ? "Buscando…" : "Buscar mi folio"}
              </button>
            </div>
          </>
        ) : (
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
              ¡Aquí está!
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Hola, {resultado.nombre.split(" ")[0]}
            </p>
            <div className="bg-[#F8F4B8] border-2 border-dashed border-[#8D0302] rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-[#8D0302] uppercase tracking-widest mb-1">
                Tu folio
              </p>
              <p
                className={`${montserrat.className} text-3xl text-[#031D2D] tracking-[0.2em]`}
              >
                {resultado.folio}
              </p>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Guarda este folio para participar en las siguientes fases.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-extrabold tracking-widest uppercase rounded-lg bg-[#8D0302] hover:bg-[#b52222] text-white border-2 border-white transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pantalla de confirmación de folio ────────────────────────────────────────
function PantallaFolio({
  registro,
  onContinuar,
}: {
  registro: RegistroExitoso;
  onContinuar: () => void;
}) {
  const [confirmado, setConfirmado] = useState(false);

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl border-6 border-[#8D0302] shadow-lg shadow-[#b4aeae] p-8 text-center relative z-30">
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
        className={`${montserrat.className} text-xl text-[#031D2D] mb-1 uppercase tracking-widest`}
      >
        ¡Listo, {registro.nombre.split(" ")[0]}!
      </h2>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">
        Ya estás registrado en la quiniela
      </p>
      <div className="bg-[#F8F4B8] border-2 border-dashed border-[#8D0302] rounded-xl p-6 mb-6">
        <p className="text-xs font-bold text-[#8D0302] uppercase tracking-widest mb-2">
          Tu folio de participación
        </p>
        <p
          className={`${montserrat.className} text-4xl text-[#031D2D] tracking-[0.2em] mb-3`}
        >
          {registro.folio}
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Guarda este folio. Lo necesitarás para participar en las siguientes
          fases del torneo.
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
        <p className="text-xs font-bold text-[#031D2D] uppercase tracking-wide mb-3">
          ¿Cómo guardar tu folio?
        </p>
        {[
          "Toma una captura de pantalla",
          "Anótalo en papel o en tus notas",
          "Si lo olvidas, recupéralo con tu teléfono y fecha de nacimiento",
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-[#8D0302] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-xs text-gray-600">{tip}</p>
          </div>
        ))}
      </div>
      <div
        className="flex items-start gap-3 mb-6 cursor-pointer text-left"
        onClick={() => setConfirmado(!confirmado)}
      >
        <div
          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${confirmado ? "bg-[#8D0302] border-[#8D0302]" : "bg-white border-gray-300"}`}
        >
          {confirmado && (
            <svg
              className="w-3 h-3 text-white"
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
          )}
        </div>
        <label className="text-xs text-gray-600 leading-relaxed cursor-pointer">
          Ya guardé mi folio{" "}
          <span className="font-bold text-[#031D2D]">{registro.folio}</span> y
          entiendo que lo necesito para las siguientes fases.
        </label>
      </div>
      <button
        onClick={onContinuar}
        disabled={!confirmado}
        className={`w-full py-3 text-sm font-extrabold tracking-widest uppercase rounded-lg border-2 transition-all ${
          confirmado
            ? "bg-[#8D0302] hover:bg-[#b52222] text-white border-white cursor-pointer"
            : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
        }`}
      >
        Continuar
      </button>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function QuinielaPage() {
  const headerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;

  const [form, setForm] = useState<FormData>({
    nombre: "",
    telefono: "",
    fecha_nacimiento: "",
    correo: "",
    colonia: "",
    aceptaBases: false,
  });

  const [errores, setErrores] = useState<FormErrors>({});
  const [cargando, setCargando] = useState(false);
  const [registrado, setRegistrado] = useState<RegistroExitoso | null>(null);
  const [mostrarRecuperar, setMostrarRecuperar] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errores[name as keyof FormErrors]) {
      setErrores((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const erroresValidacion = validarCampos(form);
    if (Object.keys(erroresValidacion).length > 0) {
      setErrores(erroresValidacion);
      return;
    }
    setCargando(true);
    setErrores({});
    try {
      const res = await fetch("/api/participantes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          telefono: form.telefono.replace(/\s/g, ""),
          fecha_nacimiento: form.fecha_nacimiento,
          correo: form.correo.trim() || undefined,
          colonia: form.colonia.trim(),
        }),
      });
      const data = await res.json();

      // Teléfono duplicado → error en campo, NO redirigir
      if (res.status === 409 && data.yaRegistrado) {
        setErrores({
          telefono: "Este número ya está registrado.",
        });
        return;
      }

      if (!res.ok) {
        if (data.campos) {
          const erroresServidor: FormErrors = {};
          for (const [campo, msgs] of Object.entries(data.campos)) {
            erroresServidor[campo as keyof FormErrors] = (msgs as string[])[0];
          }
          setErrores(erroresServidor);
        } else {
          setErrores({
            general: data.error ?? "Error inesperado. Intenta de nuevo.",
          });
        }
        return;
      }

      setRegistrado({ folio: data.folio, nombre: data.nombre });
    } catch {
      setErrores({
        general: "Error de conexión. Verifica tu internet e intenta de nuevo.",
      });
    } finally {
      setCargando(false);
    }
  }

  function handleContinuar() {
    window.location.href = "/bases";
  }

  if (registrado) {
    return (
      <div className="bg-[#E6E6E6] min-h-screen py-12 px-4">
        <PantallaFolio registro={registrado} onContinuar={handleContinuar} />
      </div>
    );
  }

  return (
    <>
      {mostrarRecuperar && (
        <ModalRecuperarFolio onClose={() => setMostrarRecuperar(false)} />
      )}

      <div className="bg-[#E6E6E6] min-h-screen">
        <div className="relative z-10 px-2 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
          <div ref={headerRef} className="relative">
            <div
              className="header-bg absolute bottom-0 left-0 right-0 flex justify-center z-40"
              style={{
                height: 350,
                transform: "translateY(25%)",
                marginTop: "-8rem",
              }}
            >
              <Sparkless containerRef={headerRef} />
              <Image
                src="/perfilP.png"
                alt="MarcoPolo"
                width={270}
                height={220}
                className="object-contain drop-shadow-lg"
                priority
              />
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="max-w-lg mx-auto bg-[#FFFFFF] rounded-b-xl rounded-t-xl border-6 border-[#8D0302] shadow-lg shadow-[#b4aeae] p-5 relative z-30"
            style={{ paddingTop: "1.5rem" }}
          >
            <h1 className="text-lg font-extrabold text-center tracking-widest uppercase text-[#031D2D] mb-1/2">
              REGÍSTRATE Y PARTICIPA
            </h1>
            <p className="text-xs font-semibold text-center tracking-widest text-[#031D2D] uppercase mb-2">
              Quiniela Ciudadana Mundial 2026
            </p>
            <p className="text-xs font-extrabold text-center tracking-widest uppercase text-[#9B100B] mb-1">
              ¡ES GRATIS!
            </p>
            <Link
              href="/quiniela/bases"
              className="inline-flex items-center gap-1 text-sm text-[#8D0302] hover:underline mb-2"
            >
              Ver bases oficiales →
            </Link>

            {errores.general && (
              <div className="mb-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-semibold">
                  {errores.general}
                </p>
              </div>
            )}

            <div className="space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Ana González Reyes"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors ${errores.nombre ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                {errores.nombre && (
                  <p className="mt-1 text-xs text-red-600">{errores.nombre}</p>
                )}
              </div>

              {/* Teléfono + Nacimiento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="4430000000"
                    maxLength={10}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors ${errores.telefono ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  />
                  {errores.telefono && (
                    <p className="mt-1 text-xs text-red-600">
                      {errores.telefono}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                    Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={form.fecha_nacimiento}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent cursor-pointer transition-colors ${errores.fecha_nacimiento ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                  />
                  {errores.fecha_nacimiento && (
                    <p className="mt-1 text-xs text-red-600">
                      {errores.fecha_nacimiento}
                    </p>
                  )}
                </div>
              </div>

              {/* Correo */}
              <div>
                <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                  Correo electrónico{" "}
                  <span className="text-gray-400 normal-case font-normal">
                    (opcional)
                  </span>
                </label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="tucorreo@email.com"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors ${errores.correo ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                {errores.correo && (
                  <p className="mt-1 text-xs text-red-600">{errores.correo}</p>
                )}
              </div>

              {/* Colonia */}
              <div>
                <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                  Colonia o barrio
                </label>
                <input
                  type="text"
                  name="colonia"
                  value={form.colonia}
                  onChange={handleChange}
                  placeholder="Ej. Ventura Puente, Torreón Nuevo…"
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent transition-colors ${errores.colonia ? "border-red-500 bg-red-50" : "border-gray-300"}`}
                />
                {errores.colonia && (
                  <p className="mt-1 text-xs text-red-600">{errores.colonia}</p>
                )}
              </div>

              {/* Acepta bases */}
              <div>
                <div className="flex items-start gap-3 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="acepto-bases"
                    name="aceptaBases"
                    checked={form.aceptaBases}
                    onChange={handleChange}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-red-700 cursor-pointer shrink-0"
                  />
                  <label
                    htmlFor="acepto-bases"
                    className="text-xs text-gray-400 leading-relaxed cursor-pointer"
                  >
                    He leído y acepto las{" "}
                    <Link
                      href="/quiniela/bases"
                      className="text-[#8D0302] hover:underline"
                    >
                      bases oficiales
                    </Link>{" "}
                    de la Quiniela Ciudadana MarcoPolo 2026.
                  </label>
                </div>
                {errores.aceptaBases && (
                  <p className="mt-1 text-xs text-red-600">
                    {errores.aceptaBases}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={cargando}
                className={`w-full mt-2 py-3 text-white text-sm font-extrabold tracking-widest uppercase rounded-lg transition-colors border-2 border-white ${cargando ? "bg-gray-400 cursor-not-allowed" : "bg-[#8D0302] hover:bg-[#b52222] cursor-pointer"}`}
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
                    Registrando…
                  </span>
                ) : (
                  "Registrarme"
                )}
              </button>

              {/* Link recuperar folio — siempre visible */}
              <div className="text-center pt-1/2">
                <button
                  type="button"
                  onClick={() => setMostrarRecuperar(true)}
                  className="text-xs text-[#8D0302] hover:text-[#8D0302] transition-colors hover:underline"
                >
                  ¿Ya te registraste y olvidaste tu folio?
                </button>
              </div>

              <p className="text-xs text-gray-400 text-center leading-relaxed">
                Tus datos serán utilizados únicamente para fines de registro,
                contacto y validación de participación de la Quiniela Ciudadana
                Morelia 2026, conforme a las bases.
              </p>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
