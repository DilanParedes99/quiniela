import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,

  async rewrites() {
    return [
      { source: "/juego", destination: "/quiniela" },
      { source: "/bases", destination: "/quiniela/bases" },
    ];
  },
};

export default nextConfig;
