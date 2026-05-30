"use client";
import Image from "next/image";
import Link from "next/link";
import Sparkless from "../components/Sparkles";
import { useRef, type RefObject } from "react";

import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

export default function QuinielaPage() {
  const headerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;

  return (
    <div className="bg-[#E6E6E6] min-h-screen">
      <div className="relative z-10 px-2 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        {/* Wrapper que contiene catedral + MarcoPolo flotante */}
        <div ref={headerRef} className="relative">
          {/* MarcoPolo encima, centrado, montado sobre el borde */}
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

        {/* Formulario — con padding top para dar espacio a la imagen flotante */}
        <div
          className="max-w-lg mx-auto bg-[#FFFFFF] rounded-b-xl rounded-t-none border-6 border-[#8D0302] shadow-lg shadow-[#b4aeae] p-5 relative z-30"
          style={{ paddingTop: "2rem" }}
        >
          {" "}
          <h1 className="text-lg font-extrabold text-center tracking-widest uppercase text-[#031D2D] mb-1">
            REGíSTRATE Y PARTICIPA
          </h1>
          <p className="text-xs font-semibold text-center tracking-widest text-[#031D2D] uppercase mb-4">
            Quiniela Ciudadana Mundial 2026
          </p>
          <p className="text-xs font-extrabold text-center tracking-widest uppercase text-[#9B100B] mb-1">
            ¡ES GRATIS!
          </p>
          <Link
            href="/quiniela/bases"
            className="inline-flex items-center gap-1 text-sm text-[#8D0302] hover:underline mb-5"
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
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent cursor-pointer"
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

            <div className="flex items-start gap-3 mt-2 cursor-pointer">
              <input
                type="checkbox"
                id="acepto-bases"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-red-700 cursor-pointer shrink-0"
              />
              <label
                htmlFor="acepto-bases"
                className="text-xs text-gray-400 leading-relaxed cursor-pointer"
              >
                He leído y acepto las{" "}
                <Link href="/bases" className="text-red-700 hover:underline">
                  bases oficiales
                </Link>{" "}
                de la Quiniela Ciudadana MarcoPolo 2026.
              </label>
            </div>
            <button className="w-full mt-2 py-3 cursor-pointer bg-[#8D0302] hover:bg-[#b52222] text-white text-sm font-extrabold tracking-widest uppercase rounded-lg transition-colors border-2 border-[#ffffff]">
              Registrarme
            </button>

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
