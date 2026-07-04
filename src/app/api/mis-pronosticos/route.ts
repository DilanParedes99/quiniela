// src/app/api/mis-pronosticos/route.ts
//
// Retorna todos los pronósticos de un participante agrupados por fase.
// Seguridad: valida que el folio existe en BD (opción A).
// La vista v_mis_pronosticos consolida todo en una sola query.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const esquema = z.object({
  folio: z.string().regex(/^MJ-[A-Z2-9]{4}$/, "Formato de folio inválido"),
});

// ─── Tipos de respuesta ───────────────────────────────────────────────────────
export interface PronosticoItem {
  partido_id: string;
  numero_partido: number;
  equipo_local: string;
  equipo_visita: string;
  fecha_inicio: string | null;
  goles_local_predichos: number;
  goles_visita_predichos: number;
  puntos_obtenidos: number | null; // null = fase no calificada
  resultado_local: number | null; // null = resultado no cargado
  resultado_visita: number | null;
}

export interface FaseConPronosticos {
  fase_id: string;
  nombre_fase: string;
  orden_fase: number;
  estado_fase: string;
  puntos_maximos_fase: number;
  puntaje_fase: number;
  foto_estado: string;
  enviado_en: string;
  pronosticos: PronosticoItem[];
}

export interface RespuestaMisPronosticos {
  folio: string;
  nombre: string;
  puntaje_total: number;
  fases: FaseConPronosticos[];
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const resultado = esquema.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json({ error: "Folio inválido." }, { status: 422 });
  }

  const { folio } = resultado.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Una sola query a la vista — sin round-trips adicionales
  const { data: filas, error } = await supabase
    .from("v_mis_pronosticos")
    .select("*")
    .eq("folio", folio);

  if (error) {
    console.error("[mis-pronosticos]", error);
    return NextResponse.json(
      { error: "Error al obtener pronósticos." },
      { status: 500 },
    );
  }

  if (!filas || filas.length === 0) {
    return NextResponse.json(
      { error: "No se encontraron pronósticos para este folio." },
      { status: 404 },
    );
  }

  // Agrupar filas por fase en el servidor — evita procesamiento en cliente
  const nombre = filas[0].nombre_participante as string;
  const fasesMap = new Map<string, FaseConPronosticos>();

  for (const fila of filas) {
    const faseId = fila.fase_id as string;

    if (!fasesMap.has(faseId)) {
      fasesMap.set(faseId, {
        fase_id: faseId,
        nombre_fase: fila.nombre_fase as string,
        orden_fase: fila.orden_fase as number,
        estado_fase: fila.estado_fase as string,
        puntos_maximos_fase: fila.puntos_maximos_fase as number,
        puntaje_fase: (fila.puntaje_fase as number) ?? 0,
        foto_estado: fila.foto_estado as string,
        enviado_en: fila.enviado_en as string,
        pronosticos: [],
      });
    }

    fasesMap.get(faseId)!.pronosticos.push({
      partido_id: fila.partido_id as string,
      numero_partido: fila.numero_partido as number,
      equipo_local: fila.equipo_local as string,
      equipo_visita: fila.equipo_visita as string,
      fecha_inicio: fila.fecha_inicio as string | null,
      goles_local_predichos: fila.goles_local_predichos as number,
      goles_visita_predichos: fila.goles_visita_predichos as number,
      puntos_obtenidos: fila.puntos_obtenidos as number | null,
      resultado_local: fila.resultado_local as number | null,
      resultado_visita: fila.resultado_visita as number | null,
    });
  }

  // Ordenar fases por orden ascendente
  const fases = Array.from(fasesMap.values()).sort(
    (a, b) => a.orden_fase - b.orden_fase,
  );

  // Puntaje total acumulado
  const puntaje_total = fases.reduce(
    (sum, f) => sum + (f.puntaje_fase ?? 0),
    0,
  );

  const respuesta: RespuestaMisPronosticos = {
    folio,
    nombre,
    puntaje_total,
    fases,
  };

  return NextResponse.json(respuesta);
}
