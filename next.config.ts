import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,

  async rewrites() {
    return [
      /*        esta parte se muestra     esta es la direcion del archivo que se va a mostrar       */
      { source: "/juego", destination: "/quiniela" },
      { source: "/bases", destination: "/quiniela/bases" },
    ];
  },
};

export default nextConfig;
