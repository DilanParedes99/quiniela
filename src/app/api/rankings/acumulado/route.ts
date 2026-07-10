// src/app/api/rankings/acumulado/route.ts
//
// Retorna el ranking acumulado top 20 desde v_ranking_acumulado.
// Endpoint público — no requiere folio.
// Se actualiza manualmente al ejecutar calificar_fase() en Supabase.

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

  return NextResponse.json({ ranking: data ?? [] });
}
