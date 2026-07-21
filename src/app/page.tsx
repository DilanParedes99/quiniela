"use client";
// src/app/page.tsx — Pantalla final: la quiniela ha terminado

import Confetti from "./components/confeti";
import AnimatedTitle from "./components/AnimatedTitle";
import Image from "next/image";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div className="hero-bg min-h-screen flex flex-col items-center bg-[#E6E6E6] relative">
      <Confetti />

      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        <div className="text-center px-4">
          <AnimatedTitle />

          <div className="w-full flex justify-center mt-2 mb-6">
            <Image
              src="/mpa2.png"
              alt="MarcoPolo juega en equipo"
              width={320}
              height={200}
              className=""
            />
          </div>

          {/* Mensaje de cierre */}
          <div className="max-w-xs mx-auto space-y-4">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-[1px] w-12 bg-gray-400" />
              <span
                className={`${montserrat.className} text-[10px] font-bold tracking-widest uppercase text-gray-400`}
              >
                Mundial 2026
              </span>
              <div className="h-[1px] w-12 bg-gray-400" />
            </div>

            <p
              className={`${montserrat.className} text-xl font-black text-[#8D0302] uppercase leading-tight`}
            >
              ¡La quiniela ha concluido!
            </p>

            <p className="text-sm text-gray-500 leading-relaxed">
              Gracias a todos los participantes de la Quiniela Mundialista con
              MarcoPolo 2026. El torneo ha llegado a su fin.
            </p>

            {/* Botón a rankings */}
            {/* <a
              href="/rankings"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#8D0302] hover:bg-[#6e0202] transition-colors rounded-full px-6 py-3 text-sm font-bold text-white tracking-wide uppercase"
            >
              🏆 Ver tabla de posiciones finales
            </a> */}

            <p className="text-[10px] text-gray-400 leading-relaxed pt-2">
              Síguenos en redes sociales para conocer a los ganadores de cada
              fase.
            </p>

            <div className="flex items-center justify-center gap-4">
              <a
                href="https://www.facebook.com/MarcoPoloAguirreChavez"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-[#8D0302] hover:underline tracking-wide"
              >
                Facebook
              </a>
              <span className="text-gray-300">·</span>
              <a
                href="https://www.instagram.com/marcopoloaguire/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-[#8D0302] hover:underline tracking-wide"
              >
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
