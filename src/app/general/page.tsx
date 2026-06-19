import { Montserrat } from "next/font/google";
import { wc26Fetch, getMatchesFallback, type OpenMatch } from "@/lib/wc26";

const montserrat = Montserrat({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
});

export const revalidate = 300;

function getToday() {
  return new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Mexico_City",
  });
}

function formatHora(dateStr: string) {
  const [datePart, timePart] = dateStr.split(" ");
  const [month, day, year] = datePart.split("/");
  const date = new Date(`${year}-${month}-${day}T${timePart}:00`);
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
}

function formatHoraFallback(timeStr: string) {
  // formato: "19:00 UTC-6"
  const [time] = timeStr.split(" ");
  return `${time} hrs`;
}

export default async function ResultadosPage() {
  let groups: any[] = [];
  let matches: any[] = [];
  let teams: any[] = [];
  let error = false;
  let usingFallback = false;

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Mexico_City",
  });

  // Intento principal — worldcup26.ir
  try {
    const [groupsRes, matchesRes, teamsRes] = await Promise.all([
      wc26Fetch("/get/groups"),
      wc26Fetch("/get/games"),
      wc26Fetch("/get/teams"),
    ]);

    teams = teamsRes.teams ?? [];
    matches = matchesRes.games ?? [];
    groups = groupsRes.groups ?? [];

    // Si viene vacío también usamos fallback
    if (matches.length === 0 && groups.length === 0) {
      throw new Error("Respuesta vacía");
    }
  } catch {
    usingFallback = true;
  }

  // Mapa de equipos por ID (solo si hay datos de worldcup26.ir)
  const teamMap: Record<string, any> = {};
  teams.forEach((t: any) => {
    teamMap[t.id] = t;
  });

  // Filtrar partidos de hoy — fuente principal
  const todayMatches = matches.filter((m: any) => {
    if (!m.local_date) return false;
    const [datePart] = m.local_date.split(" ");
    const [month, day, year] = datePart.split("/");
    const matchDate = `${year}-${month}-${day}`;
    return matchDate === todayStr;
  });

  // Fallback — openfootball
  let fallbackTodayMatches: OpenMatch[] = [];

  if (usingFallback) {
    try {
      const all = await getMatchesFallback();
      fallbackTodayMatches = all.filter((m) => m.date === todayStr);
    } catch {
      error = true; // ambas fuentes fallaron
    }
  }

  return (
    <div className="bg-[#E6E6E6] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="h-[2px] w-16 bg-gray-400" />
            <span
              className={`${montserrat.className} text-xs font-bold tracking-widest uppercase text-gray-500`}
            >
              Mundial 2026
            </span>
            <div className="h-[2px] w-16 bg-gray-400" />
          </div>
          <h1
            className={`${montserrat.className} text-2xl font-black text-[#8D0302] leading-tight`}
          >
            Resultados & Posiciones
          </h1>
          <p className="text-xs text-gray-400 mt-1 capitalize">{getToday()}</p>
        </div>

        {/* Error — solo si ambas fuentes fallaron */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-sm text-red-600 mb-6">
            No se pudieron cargar los datos. Intenta de nuevo en unos minutos.
          </div>
        )}

        {/* Aviso de fallback */}
        {usingFallback && !error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 mb-4 text-xs text-yellow-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>
              Datos de respaldo — marcadores pueden no estar actualizados
            </span>
          </div>
        )}

        {/* Banner de fase activa */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 mb-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">
              Fase activa
            </p>
            <p
              className={`${montserrat.className} text-sm font-black text-[#031D2D]`}
            >
              Octavos de Final
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">
              Cierre de registro
            </p>
            <p
              className={`${montserrat.className} text-sm font-black text-[#8D0302]`}
            >
              28 jun – 3 jul 2026 · 23:59 hrs
            </p>
          </div>
        </div>

        {/* Partidos de hoy */}
        <section className="mb-8">
          <h2
            className={`${montserrat.className} text-xs font-black tracking-widest uppercase text-gray-500 mb-3`}
          >
            ⚽ Partidos de hoy
          </h2>

          {/* Render fuente principal */}
          {!usingFallback && (
            <>
              {todayMatches.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
                  No hay partidos programados para hoy
                </div>
              ) : (
                <div className="space-y-2">
                  {todayMatches.map((m: any) => {
                    const home = teamMap[m.home_team_id];
                    const away = teamMap[m.away_team_id];
                    const finished =
                      m.finished === true || m.finished === "true";
                    const hasScore =
                      m.home_score !== null && m.home_score !== undefined;
                    const live = !finished && hasScore;

                    return (
                      <div
                        key={m.id}
                        className="bg-white rounded-xl border border-gray-200 px-4 py-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            Grupo {m.group} · Jornada {m.matchday}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase flex items-center gap-1 ${
                              finished
                                ? "text-gray-400"
                                : live
                                  ? "text-green-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {live && (
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                            )}
                            {finished
                              ? "Final"
                              : live
                                ? "En Vivo"
                                : formatHora(m.local_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            {home?.flag && (
                              <img
                                src={home.flag}
                                alt={home.name_en}
                                className="w-5 h-4 object-cover rounded-sm"
                              />
                            )}
                            <span
                              className={`${montserrat.className} text-sm font-bold text-[#031D2D]`}
                            >
                              {home?.name_en ?? `Equipo ${m.home_team_id}`}
                            </span>
                          </div>
                          <div className="mx-3 min-w-[4.5rem] text-center">
                            {finished || live ? (
                              <span
                                className={`${montserrat.className} text-xl font-black text-[#031D2D]`}
                              >
                                {m.home_score ?? 0} — {m.away_score ?? 0}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300 font-bold">
                                vs
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-1 justify-end">
                            <span
                              className={`${montserrat.className} text-sm font-bold text-[#031D2D] text-right`}
                            >
                              {away?.name_en ?? `Equipo ${m.away_team_id}`}
                            </span>
                            {away?.flag && (
                              <img
                                src={away.flag}
                                alt={away.name_en}
                                className="w-5 h-4 object-cover rounded-sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Render fallback — openfootball */}
          {usingFallback && !error && (
            <>
              {fallbackTodayMatches.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
                  No hay partidos programados para hoy
                </div>
              ) : (
                <div className="space-y-2">
                  {fallbackTodayMatches.map((m, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-xl border border-gray-200 px-4 py-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          {m.group} · {m.round}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {formatHoraFallback(m.time)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`${montserrat.className} text-sm font-bold text-[#031D2D] flex-1`}
                        >
                          {m.team1}
                        </span>
                        <div className="mx-3 min-w-[4.5rem] text-center">
                          {m.score1 !== undefined ? (
                            <span
                              className={`${montserrat.className} text-xl font-black text-[#031D2D]`}
                            >
                              {m.score1} — {m.score2}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300 font-bold">
                              vs
                            </span>
                          )}
                        </div>
                        <span
                          className={`${montserrat.className} text-sm font-bold text-[#031D2D] flex-1 text-right`}
                        >
                          {m.team2}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        {/* Posiciones por grupo */}
        <section>
          <h2
            className={`${montserrat.className} text-xs font-black tracking-widest uppercase text-gray-500 mb-3`}
          >
            📊 Posiciones por grupo
          </h2>

          {/* Fallback no tiene posiciones */}
          {usingFallback ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
              Las posiciones no están disponibles en modo de respaldo
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
              No se pudieron cargar las posiciones
            </div>
          ) : (
            <div className="space-y-4">
              {groups
                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                .map((g: any) => (
                  <div
                    key={g.name}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div className="bg-[#8D0302] px-4 py-2">
                      <span
                        className={`${montserrat.className} text-xs font-black text-white tracking-widest uppercase`}
                      >
                        Grupo {g.name}
                      </span>
                    </div>
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="text-left px-3 py-2 text-gray-400 font-bold w-6">
                            #
                          </th>
                          <th className="text-left px-2 py-2 text-gray-400 font-bold">
                            Equipo
                          </th>
                          <th className="px-2 py-2 text-gray-400 font-bold text-center">
                            PJ
                          </th>
                          <th className="px-2 py-2 text-gray-400 font-bold text-center">
                            G
                          </th>
                          <th className="px-2 py-2 text-gray-400 font-bold text-center">
                            E
                          </th>
                          <th className="px-2 py-2 text-gray-400 font-bold text-center">
                            P
                          </th>
                          <th className="px-2 py-2 text-gray-400 font-bold text-center">
                            GD
                          </th>
                          <th className="px-2 py-2 text-[#8D0302] font-black text-center">
                            Pts
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {g.teams
                          ?.sort(
                            (a: any, b: any) =>
                              Number(b.pts) - Number(a.pts) ||
                              Number(b.gd) - Number(a.gd),
                          )
                          .map((t: any, i: number) => {
                            const team = teamMap[t.team_id];
                            return (
                              <tr
                                key={t.team_id}
                                className={`border-b border-gray-50 last:border-0 ${i < 2 ? "bg-green-50" : ""}`}
                              >
                                <td className="px-3 py-2 text-gray-300 font-bold">
                                  {i + 1}
                                </td>
                                <td className="px-2 py-2">
                                  <div className="flex items-center gap-1.5">
                                    {team?.flag && (
                                      <img
                                        src={team.flag}
                                        alt={team.name_en}
                                        className="w-5 h-3.5 object-cover rounded-sm shrink-0"
                                      />
                                    )}
                                    <span
                                      className={`${montserrat.className} font-bold text-[#031D2D]`}
                                    >
                                      {team?.name_en ?? `#${t.team_id}`}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-2 py-2 text-center text-gray-600">
                                  {t.mp ?? 0}
                                </td>
                                <td className="px-2 py-2 text-center text-gray-600">
                                  {t.w ?? 0}
                                </td>
                                <td className="px-2 py-2 text-center text-gray-600">
                                  {t.d ?? 0}
                                </td>
                                <td className="px-2 py-2 text-center text-gray-600">
                                  {t.l ?? 0}
                                </td>
                                <td className="px-2 py-2 text-center text-gray-600">
                                  {Number(t.gd) > 0 ? `+${t.gd}` : (t.gd ?? 0)}
                                </td>
                                <td className="px-2 py-2 text-center font-black text-[#8D0302]">
                                  {t.pts ?? 0}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          )}
        </section>

        <p className="text-center text-[10px] text-gray-400 mt-6 pb-4">
          {usingFallback
            ? "Datos de respaldo · openfootball"
            : "Datos vía worldcup26.ir · Actualizado cada 5 min"}
        </p>
      </div>
    </div>
  );
}
