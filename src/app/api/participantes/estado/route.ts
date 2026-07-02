// src/app/api/participantes/estado/route.ts
//
// Endpoint consolidado que resuelve en una sola llamada:
// 1. Validez del folio
// 2. Fase activa del torneo
// 3. Si el participante ya envió pronósticos en esa fase
//
// Usado desde / para decidir a dónde redirigir sin múltiples
// round-trips ni navegaciones intermedias.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const esquema = z.object({
  folio: z.string().regex(/^MJ-[A-Z2-9]{4}$/, "Formato de folio inválido"),
});

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

  // 1. Verificar folio
  const { data: participante } = await supabase
    .from("participantes")
    .select("id, folio, nombre")
    .eq("folio", folio)
    .maybeSingle();

  if (!participante) {
    return NextResponse.json(
      { error: "Folio no encontrado." },
      { status: 404 },
    );
  }

  // 2. Fase activa
  const { data: fase } = await supabase
    .from("fases")
    .select("id, nombre, orden, estado, registro_abre_en, registro_cierra_en")
    .eq("estado", "abierta")
    .maybeSingle();

  // 3. Si hay fase activa, verificar si ya participó
  let yaParticipo = false;
  if (fase) {
    const { data: registro } = await supabase
      .from("registros")
      .select("id")
      .eq("participante_id", participante.id)
      .eq("fase_id", fase.id)
      .maybeSingle();

    yaParticipo = !!registro;
  }

  return NextResponse.json({
    folio: participante.folio,
    nombre: participante.nombre,
    fase_activa: fase ?? null,
    ya_participo: yaParticipo,
  });
}
