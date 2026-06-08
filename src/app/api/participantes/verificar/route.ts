// src/app/api/participantes/verificar/route.ts
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

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: participante } = await supabase
    .from("participantes")
    .select("folio, nombre")
    .eq("folio", resultado.data.folio)
    .maybeSingle();

  if (!participante) {
    return NextResponse.json(
      { error: "Folio no encontrado." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    folio: participante.folio,
    nombre: participante.nombre,
  });
}
