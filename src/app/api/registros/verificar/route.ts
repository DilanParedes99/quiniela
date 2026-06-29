// src/app/api/registros/verificar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const esquema = z.object({
  folio: z.string().regex(/^MJ-[A-Z2-9]{4}$/),
  fase_orden: z.number().int().min(1).max(4),
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
    return NextResponse.json({ error: "Datos inválidos." }, { status: 422 });
  }

  const { folio, fase_orden } = resultado.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Obtener participante
  const { data: participante } = await supabase
    .from("participantes")
    .select("id")
    .eq("folio", folio)
    .maybeSingle();

  if (!participante) {
    return NextResponse.json({ error: "Folio no válido." }, { status: 403 });
  }

  // Obtener fase
  const { data: fase } = await supabase
    .from("fases")
    .select("id")
    .eq("orden", fase_orden)
    .maybeSingle();

  if (!fase) {
    return NextResponse.json({ error: "Fase no encontrada." }, { status: 404 });
  }

  // Verificar si ya tiene registro en esta fase
  const { data: registro } = await supabase
    .from("registros")
    .select("id, foto_estado, puntaje_fase, enviado_en")
    .eq("participante_id", participante.id)
    .eq("fase_id", fase.id)
    .maybeSingle();

  return NextResponse.json({
    yaParticipo: !!registro,
    registro: registro ?? null,
  });
}
