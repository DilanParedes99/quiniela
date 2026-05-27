import Image from "next/image";
import Link from "next/link";

import { Anton, Black_Ops_One } from "next/font/google";

const anton = Anton({ weight: "400", subsets: ["latin"] });

export default function QuinielaPage() {
  return (
    <div className="bg-[#F4D5AA] min-h-screen">
      <div className="px-2 py-2 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        {/* Header */}
        <div className="w-full overflow-hidden px-4 pt-2 pb-6">
          <div
            className="w-full flex flex-col items-stretch py-2"
            style={{ transform: "rotate(-4deg)" }}
          >
            <span
              className={`${anton.className} block w-full text-center whitespace-nowrap uppercase`}
              style={
                {
                  fontSize: "clamp(2.8rem, 12vw, 5.5rem)",
                  lineHeight: ".95",
                  letterSpacing: ".02em",
                  color: "#8D0302",
                  WebkitTextStroke: "9px #fff",
                  paintOrder: "stroke fill",
                  marginBottom: ".05em",
                } as React.CSSProperties
              }
            >
              Marcopolo
            </span>
            <span
              className={`${anton.className} block w-full text-center whitespace-nowrap uppercase`}
              style={
                {
                  fontSize: "clamp(1.6rem, 7vw, 3.2rem)",
                  lineHeight: ".95",
                  letterSpacing: ".02em",
                  color: "#011933",
                  WebkitTextStroke: "7px #fff",
                  paintOrder: "stroke fill",
                } as React.CSSProperties
              }
            >
              Juega en Equipo
            </span>
            <div className="flex justify-center mt-1">
              <span
                className={`${anton.className} text-center whitespace-nowrap uppercase text-white`}
                style={
                  {
                    background: "#8D0302",
                    fontSize: "clamp(.95rem, 3.5vw, 1.4rem)",
                    letterSpacing: ".08em",
                    padding: ".45rem 2.5rem",
                    display: "inline-block",
                    clipPath:
                      "polygon(0 0, 100% 0, calc(100% - 12px) 50%, 100% 100%, 0 100%, 12px 50%)",
                  } as React.CSSProperties
                }
              >
                Quiniela Ciudadana Mundial 2026
              </span>
            </div>
          </div>
        </div>

        {/* Formulario centrado */}
        <div className="max-w-lg mx-auto bg-[#FDF7E9] rounded-xl border-2 border-[#181D3A] p-5">
          <h1 className="text-lg font-extrabold text-center tracking-widest uppercase text-[#031D2D] mb-1">
            REGíSTRATE Y PARTICIPA
          </h1>

          <p className="text-xs font-extrabold text-center tracking-widest uppercase text-[#9B100B] mb-1">
            ¡ES GRATIS!
          </p>

          <Link
            href="/quiniela/bases"
            className="inline-flex items-center gap-1 text-sm text-red-700 hover:underline mb-5"
          >
            Ver bases oficiales →
          </Link>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                Nombre completo
              </label>
              <input
                type="text"
                placeholder="Ej. Ana González Reyes"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="443 000 0000"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                  Nacimiento
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tucorreo@email.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-extrabold text-[#031D2D] mb-1 tracking-wide uppercase">
                Colonia o barrio
              </label>
              <input
                type="text"
                placeholder="Ej. Chapultepec, Las Américas…"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>

            <button className="w-full mt-2 py-3 bg-red-700 hover:bg-red-800 text-white text-sm font-extrabold tracking-widest uppercase rounded-lg transition-colors border-2 border-[#181D3A]">
              Registrarme
            </button>

            <div className="flex items-start gap-3 mt-2">
              <input
                type="checkbox"
                id="acepto-bases"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-red-700 cursor-pointer shrink-0"
              />
              <label
                htmlFor="acepto-bases"
                className="text-xs text-gray-500 leading-relaxed cursor-pointer"
              >
                He leído y acepto las{" "}
                <Link href="/bases" className="text-red-700 hover:underline">
                  bases oficiales
                </Link>{" "}
                de la Quiniela Ciudadana MarcoPolo 2026.
              </label>
            </div>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              Tus datos serán utilizados únicamente para fines de registro,
              contacto y validación de participación de la Quiniela Ciudadana
              Morelia 2026, conforme a las bases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
