// src/app/api/rankings/fase/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const FASES: Record<number, { id: string; nombre: string; limite: number }> = {
  1: {
    id: "2c14aad2-f414-4b4a-b310-56a0c7c10b28",
    nombre: "Octavos",
    limite: 100,
  },
  2: {
    id: "7654f3fc-ab3e-4324-b2d6-518e0b783c1d",
    nombre: "Cuartos",
    limite: 50,
  },
  3: {
    id: "65f7149e-25b0-444b-8081-4e2c1c30d876",
    nombre: "Semifinal",
    limite: 30,
  },
  4: {
    id: "4c4f409b-3447-4f56-9391-561fc25de3cd",
    nombre: "Final",
    limite: 20,
  },
};

const esquema = z.object({
  orden: z.number().int().min(1).max(4),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ordenRaw = parseInt(searchParams.get("orden") ?? "");

  const resultado = esquema.safeParse({ orden: ordenRaw });
  if (!resultado.success) {
    return NextResponse.json(
      { error: "Orden de fase inválido." },
      { status: 400 },
    );
  }

  const { orden } = resultado.data;
  const config = FASES[orden];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Paso 1: obtener registros aprobados con puntaje
  const { data: registros, error: errorRegistros } = await supabase
    .from("registros")
    .select("participante_id, puntaje_fase, foto_estado")
    .eq("fase_id", config.id)
    .eq("foto_estado", "aprobada")
    .order("puntaje_fase", { ascending: false, nullsFirst: false })
    .limit(config.limite);

  if (errorRegistros) {
    console.error("[rankings/fase] registros:", errorRegistros);
    return NextResponse.json(
      { error: "Error al obtener el ranking." },
      { status: 500 },
    );
  }

  if (!registros || registros.length === 0) {
    return NextResponse.json({
      fase: { orden, nombre: config.nombre },
      ranking: [],
    });
  }

  // Paso 2: obtener nombres de los participantes
  const ids = registros.map((r) => r.participante_id);

  const { data: participantes, error: errorPart } = await supabase
    .from("participantes")
    .select("id, nombre")
    .in("id", ids);

  if (errorPart) {
    console.error("[rankings/fase] participantes:", errorPart);
    return NextResponse.json(
      { error: "Error al obtener participantes." },
      { status: 500 },
    );
  }

  const mapaParticipantes: Record<string, string> = {};
  (participantes ?? []).forEach((p) => {
    mapaParticipantes[p.id] = p.nombre;
  });

  // Paso 3: posición secuencial simple (sin agrupar empates)
  const ranking = registros.map((row, idx) => ({
    posicion: idx + 1,
    nombre: mapaParticipantes[row.participante_id] ?? "—",
    puntaje_fase: row.puntaje_fase ?? 0,
  }));

  return NextResponse.json({
    fase: { orden, nombre: config.nombre },
    ranking,
  });
}
