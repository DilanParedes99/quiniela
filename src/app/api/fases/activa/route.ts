// src/app/api/fases/activa/route.ts
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
      "id, nombre, orden, total_partidos, registro_abre_en, registro_cierra_en, estado",
    )
    .eq("estado", "abierta")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "Error al obtener fase activa." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ fase: null }, { status: 200 });
  }

  return NextResponse.json({ fase: data });
}
