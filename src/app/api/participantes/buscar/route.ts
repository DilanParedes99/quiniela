// src/app/api/participantes/buscar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const intentos = new Map<string, { count: number; resetAt: number }>();
const LIMITE = 5;
const VENTANA_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const ahora = Date.now();
  const entry = intentos.get(ip);
  if (!entry || ahora > entry.resetAt) {
    intentos.set(ip, { count: 1, resetAt: ahora + VENTANA_MS });
    return true;
  }
  if (entry.count >= LIMITE) return false;
  entry.count++;
  return true;
}

const esquemaBuscar = z.object({
  telefono: z
    .string()
    .regex(/^[0-9]{10}$/, "El teléfono debe tener exactamente 10 dígitos"),
  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
});

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e intenta de nuevo." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const resultado = esquemaBuscar.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos.",
        campos: resultado.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { telefono, fecha_nacimiento } = resultado.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: participante } = await supabase
    .from("participantes")
    .select("folio, nombre")
    .eq("telefono", telefono)
    .eq("fecha_nacimiento", fecha_nacimiento)
    .maybeSingle();

  // Siempre el mismo mensaje — no revelar si el teléfono existe o no
  if (!participante) {
    return NextResponse.json(
      {
        error:
          "No encontramos un registro con esos datos. Verifica tu teléfono y fecha de nacimiento.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    folio: participante.folio,
    nombre: participante.nombre,
  });
}
