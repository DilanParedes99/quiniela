// src/app/api/rankings/acumulado/route.ts
//
// Retorna el ranking acumulado top 20 desde v_ranking_acumulado.
// Posición secuencial simple — sin agrupar empates.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("v_ranking_acumulado")
    .select("posicion_acumulada, nombre_participante, puntaje_total")
    .order("posicion_acumulada", { ascending: true })
    .limit(20);

  if (error) {
    console.error("[rankings/acumulado]", error);
    return NextResponse.json(
      { error: "Error al obtener el ranking." },
      { status: 500 },
    );
  }

  // Posición secuencial simple — ignora posicion_acumulada de la vista
  const ranking = (data ?? []).map((row, idx) => ({
    posicion: idx + 1,
    nombre_participante: row.nombre_participante,
    puntaje_total: row.puntaje_total ?? 0,
  }));

  return NextResponse.json({ ranking });
}
