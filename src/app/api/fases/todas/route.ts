// src/app/api/fases/todas/route.ts
//
// Retorna las 4 fases ordenadas con su estado actual.
// Usa anon key — fases tiene RLS de lectura pública.
// Usado por QuinielaNav en /general para mostrar estado dinámico.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data, error } = await supabase
    .from("fases")
    .select(
      "id, nombre, orden, estado, registro_abre_en, registro_cierra_en, puntos_maximos",
    )
    .order("orden", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener fases." },
      { status: 500 },
    );
  }

  return NextResponse.json({ fases: data ?? [] });
}
