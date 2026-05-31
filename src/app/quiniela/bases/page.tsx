import Link from "next/link";

const secciones = [
  {
    label: "Naturaleza de la dinámica",
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Dinámica recreativa y familiar que fomenta la convivencia, el espíritu
        deportivo y el trabajo en equipo durante el Mundial 2026. No tiene fines
        electorales ni partidistas.
      </p>
    ),
  },
  {
    label: "Participantes",
    content: (
      <ul className="space-y-1">
        {[
          "Mayores de 18 años",
          "Residentes del municipio de Morelia",
          'Personas que cuenten con el calendario oficial 2026 "Morelia juega en equipo"',
          "Participación gratuita",
        ].map((item) => (
          <li
            key={item}
            className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
          >
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    label: "Modalidad de registro por fases",
    content: (
      <div>
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Registros independientes por cada fase del Mundial, a través de
          formularios distintos habilitados conforme avance el torneo.
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            "1. Octavos de Final",
            "2. Cuartos de Final",
            "3. Semifinal",
            "4. Final",
          ].map((fase) => (
            <div key={fase} className="bg-red-50 rounded-lg px-3 py-2">
              <p className="text-xs font-bold text-red-700">{fase}</p>
            </div>
          ))}
        </div>
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 text-sm text-red-900 leading-relaxed">
          Cada participante únicamente podrá realizar un registro por fase,
          validado mediante el número telefónico proporcionado en el formulario.
        </div>
      </div>
    ),
  },
  {
    label: "Forma de participación",
    content: (
      <div>
        <ul className="space-y-1 mb-4">
          {[
            "Llenar la quiniela en el calendario impreso",
            "Escanear el código QR",
            "Ingresar al formulario de la fase vigente",
            "Registrar pronósticos",
            "Subir fotografía clara del calendario llenado a mano",
            "Aceptar las presentes bases",
          ].map((item) => (
            <li
              key={item}
              className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 text-sm text-red-900 leading-relaxed">
          Cada fase requiere registro independiente, incluso si participaste en
          fases anteriores.
        </div>
      </div>
    ),
  },
  {
    label: "Periodos de registro",
    content: (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-red-50">
              {["Fase", "Periodo de registro", "Cierre"].map((h) => (
                <th
                  key={h}
                  className="text-left text-red-700 font-bold px-2 py-2 border-b border-red-100 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Octavos", "28 jun – 3 jul 2026", "23:59 hrs"],
              ["Cuartos", "4 – 8 jul 2026", "23:59 hrs"],
              ["Semifinal", "9 – 13 jul 2026", "23:59 hrs"],
              ["Final", "14 – 18 jul 2026", "23:59 hrs"],
            ].map((row) => (
              <tr
                key={row[0]}
                className="border-b border-gray-100 last:border-0"
              >
                {row.map((cell, i) => (
                  <td key={i} className="px-2 py-2 text-gray-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          No se aceptarán registros posteriores a la fecha y hora establecidas
          para cada fase.
        </p>
      </div>
    ),
  },
  {
    label: "Sistema de puntuación",
    content: (
      <div>
        <ul className="space-y-1 mb-4">
          {[
            "Acierto al ganador del encuentro: 1 punto",
            "Acierto exacto al marcador del encuentro: 2 puntos adicionales",
          ].map((item) => (
            <li
              key={item}
              className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 text-sm text-red-900 leading-relaxed">
          El participante que acierte tanto el ganador como el marcador exacto
          podrá obtener un máximo de <strong>3 puntos por partido</strong>.
        </div>
      </div>
    ),
  },
  {
    label: "Evaluación por fase",
    content: (
      <div>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Cada fase será evaluada de manera independiente. Los participantes
          podrán resultar ganadores en una fase específica o en la evaluación
          acumulada general.
        </p>
        <ul className="space-y-1">
          {[
            "Registrarse en la fase que deseen",
            "Participar en una o en varias fases",
            "Competir únicamente dentro de la fase en la que se hayan registrado",
          ].map((item) => (
            <li
              key={item}
              className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    label: "Criterios para determinar ganadores",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
            Por fase — hasta 100 ganadores
          </p>
          <ul className="space-y-1">
            {[
              "Se considerará el mayor número de aciertos en la fase correspondiente",
              "En empate: mayor puntaje acumulado en la fase posterior inmediata",
              "De persistir empate: mayor puntaje acumulado o sorteo aleatorio",
            ].map((item) => (
              <li
                key={item}
                className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">
            Acumulado general — hasta 3 ganadores
          </p>
          <ul className="space-y-1">
            {[
              "Mayor puntaje total acumulado en las cuatro fases",
              "En empate: prioridad al mayor puntaje en la Final",
              "De persistir: se considera sucesivamente Semifinal y Cuartos",
              "De continuar empate: sorteo aleatorio",
            ].map((item) => (
              <li
                key={item}
                className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 text-sm text-red-900 leading-relaxed">
          La decisión de los organizadores será definitiva e inapelable.
        </div>
      </div>
    ),
  },
  {
    label: "Ponderación por fase",
    content: (
      <div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-red-50">
                {["Fase", "Partidos", "Marcador", "Ganador", "Máx."].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left text-red-700 font-bold px-2 py-2 border-b border-red-100 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {[
                ["Octavos", "8", "2 pts", "1 pt", "24 pts"],
                ["Cuartos", "4", "2 pts", "1 pt", "12 pts"],
                ["Semifinal", "2", "2 pts", "1 pt", "6 pts"],
                ["Final", "1", "2 pts", "1 pt", "3 pts"],
              ].map((row) => (
                <tr
                  key={row[0]}
                  className="border-b border-gray-100 last:border-0"
                >
                  {row.map((cell, i) => (
                    <td key={i} className="px-2 py-2 text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 mt-3 text-sm text-red-900">
          Puntaje máximo acumulado en las cuatro fases:{" "}
          <strong>45 puntos</strong>.
        </div>
      </div>
    ),
  },
  {
    label: "Premios por fase",
    content: (
      <div>
        {[
          { fase: "Octavos", premio: "Termos" },
          { fase: "Cuartos", premio: "Balones" },
          { fase: "Semifinal", premio: "Gorras" },
          { fase: "Final", premio: "Jerseys" },
          {
            fase: "Acumulado",
            premio:
              'Kit "Final en Equipo": parrilla portátil, hielera, sillas plegables, kit botanero',
          },
        ].map(({ fase, premio }) => (
          <div
            key={fase}
            className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0"
          >
            <span className="text-xs font-bold text-red-700 min-w-[5rem] shrink-0">
              {fase}
            </span>
            <span className="text-sm text-gray-700">{premio}</span>
          </div>
        ))}
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 mt-3 text-sm text-red-900">
          No se entregarán premios en efectivo.
        </div>
      </div>
    ),
  },
  {
    label: "Publicación de resultados",
    content: (
      <div className="flex flex-wrap gap-2 mt-1">
        {["Facebook: Marco Polo Aguirre", "Instagram: @marcopoloaguirre"].map(
          (red) => (
            <Link
              key={red}
              href={
                red.includes("Facebook")
                  ? "https://www.facebook.com/MarcoPoloAguirreChavez"
                  : "https://www.instagram.com/marcopoloaguire/"
              }
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-full font-semibold"
            >
              {red}
            </Link>
          ),
        )}
      </div>
    ),
  },
  {
    label: "Protección de datos",
    content: (
      <ul className="space-y-1">
        {[
          "Datos usados exclusivamente para contacto relacionado con esta dinámica",
          "No se utilizarán con fines electorales, comerciales ni distintos a los aquí señalados",
          "No serán compartidos con terceros ajenos a la presente dinámica",
        ].map((item) => (
          <li
            key={item}
            className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
          >
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    label: "Validación de participación",
    content: (
      <div>
        <p className="text-sm text-gray-600 mb-2">
          Los organizadores podrán invalidar registros que presenten:
        </p>
        <ul className="space-y-1 mb-3">
          {[
            "Información falsa o incompleta",
            "Fotografías digitales alteradas o ilegibles",
            "Participaciones duplicadas",
            "Registros enviados fuera del periodo establecido",
          ].map((item) => (
            <li
              key={item}
              className="text-sm text-gray-600 leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-red-700 before:font-bold"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 text-sm text-red-900 leading-relaxed">
          Los organizadores podrán solicitar evidencia adicional para validar
          cualquier participación.
        </div>
      </div>
    ),
  },
  {
    label: "Modificaciones",
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Los organizadores podrán realizar ajustes operativos o aclaraciones a la
        presente dinámica en caso de ser necesario, informándolo oportunamente a
        través de los medios oficiales.
      </p>
    ),
  },
  {
    label: "Carácter de la dinámica",
    content: (
      <p className="text-sm text-gray-600 leading-relaxed">
        Dinámica con carácter exclusivamente recreativo y de participación
        ciudadana. La participación no condiciona ni genera relación alguna con
        programas sociales, apoyos gubernamentales o actividades de carácter
        electoral.
      </p>
    ),
  },
  {
    label: "Aceptación de bases",
    content: (
      <div className="bg-red-50 border-l-2 border-red-700 rounded-r-lg px-4 py-3 text-sm text-red-900 leading-relaxed">
        El envío del formulario correspondiente a cada fase implica la
        aceptación total de las presentes bases.
      </div>
    ),
  },
];

export default function BasesPage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="px-4 py-12 mx-auto max-w-2xl md:px-8 lg:py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[2px] w-20 bg-gray-300" />
            <span className="font-extrabold text-black text-xs tracking-widest uppercase">
              Bases Oficiales
            </span>
            <div className="h-[2px] w-20 bg-gray-300" />
          </div>
          <h1 className="font-extrabold text-red-700 leading-none tracking-tight text-3xl sm:text-4xl mb-2">
            Morelia juega en equipo
          </h1>
          <p className="text-base text-gray-700">
            Quiniela Ciudadana Mundial 2026
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-3">
          {secciones.map(({ label, content }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-200 px-6 py-5"
            >
              <p className="text-xs font-extrabold tracking-widest uppercase text-gray-400 mb-3">
                {label}
              </p>
              {content}
            </div>
          ))}
        </div>

        {/* Volver */}
        <div className="mt-8 text-center">
          <Link
            href="/quiniela"
            className="inline-flex items-center gap-1 text-sm text-red-700 hover:underline"
          >
            ← Volver al registro
          </Link>
        </div>
      </div>
    </div>
  );
}
