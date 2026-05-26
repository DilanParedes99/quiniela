import Link from "next/link";

export default function QuinielaPage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-4 py-12 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[2px] w-20 bg-gray-300" />
            <span className="font-extrabold text-black text-xs tracking-widest uppercase">
              Quiniela Ciudadana
            </span>
            <div className="h-[2px] w-20 bg-gray-300" />
          </div>
          <h2 className="font-extrabold text-red-700 leading-none tracking-tight text-3xl sm:text-4xl mb-2">
            Marco Polo juega en equipo
          </h2>
          <p className="text-base text-gray-700">Mundial 2026</p>
        </div>

        {/* Formulario centrado */}
        <div className="max-w-lg mx-auto bg-white rounded-xl border border-gray-200 p-7">
          <p className="text-xs font-extrabold tracking-widest uppercase text-gray-400 mb-1">
            Registro de participante
          </p>

          <Link
            href="/bases"
            className="inline-flex items-center gap-1 text-sm text-red-700 hover:underline mb-5"
          >
            Ver bases oficiales →
          </Link>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 tracking-wide uppercase">
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
                <label className="block text-xs font-bold text-gray-600 mb-1 tracking-wide uppercase">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="443 000 0000"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1 tracking-wide uppercase">
                  Nacimiento
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 tracking-wide uppercase">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="tucorreo@email.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1 tracking-wide uppercase">
                Colonia o barrio
              </label>
              <input
                type="text"
                placeholder="Ej. Chapultepec, Las Américas…"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-transparent"
              />
            </div>

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

            <button className="w-full mt-2 py-3 bg-red-700 hover:bg-red-800 text-white text-sm font-extrabold tracking-widest uppercase rounded-lg transition-colors">
              Registrarme →
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
