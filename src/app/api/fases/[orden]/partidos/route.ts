// src/app/api/fases/[orden]/partidos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orden: string } },
) {
  const orden = parseInt(params.orden);
  if (isNaN(orden) || orden < 1 || orden > 4) {
    return NextResponse.json(
      { error: "Orden de fase inválido." },
      { status: 400 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Obtener fase por orden
  const { data: fase, error: errorFase } = await supabase
    .from("fases")
    .select("id, nombre, orden, estado, registro_abre_en, registro_cierra_en")
    .eq("orden", orden)
    .maybeSingle();

  if (errorFase || !fase) {
    return NextResponse.json({ error: "Fase no encontrada." }, { status: 404 });
  }

  // Obtener partidos de esa fase
  const { data: partidos, error: errorPartidos } = await supabase
    .from("partidos")
    .select("id, numero, equipo_local, equipo_visita, fecha_inicio, definido")
    .eq("fase_id", fase.id)
    .order("numero", { ascending: true });

  if (errorPartidos) {
    return NextResponse.json(
      { error: "Error al obtener partidos." },
      { status: 500 },
    );
  }

  return NextResponse.json({ fase, partidos: partidos ?? [] });
}
