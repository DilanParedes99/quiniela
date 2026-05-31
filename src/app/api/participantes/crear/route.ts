// src/app/api/participantes/crear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// ─── Rate limiting simple en memoria ──────────────────────────────────────────
// En producción considera upstash/ratelimit o similar
const intentos = new Map<string, { count: number; resetAt: number }>();
const LIMITE = 5;
const VENTANA_MS = 60_000; // 1 minuto

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

// ─── Schema Zod ───────────────────────────────────────────────────────────────
const esquemaParticipante = z.object({
  nombre: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(120, "El nombre es demasiado largo")
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
      "El nombre contiene caracteres inválidos",
    ),

  telefono: z
    .string()
    .regex(/^[0-9]{10}$/, "El teléfono debe tener exactamente 10 dígitos"),

  fecha_nacimiento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido")
    .refine((fecha) => {
      const d = new Date(fecha);
      const hoy = new Date();
      const minima = new Date("1900-01-01");
      return d < hoy && d > minima;
    }, "Fecha de nacimiento inválida"),

  correo: z
    .string()
    .email("Correo electrónico inválido")
    .optional()
    .or(z.literal("")),

  colonia: z
    .string()
    .min(2, "La colonia debe tener al menos 2 caracteres")
    .max(120, "La colonia es demasiado larga"),
});

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Rate limiting por IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera un momento e intenta de nuevo." },
      { status: 429 },
    );
  }

  // Parsear body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  // Validar con Zod
  const resultado = esquemaParticipante.safeParse(body);
  if (!resultado.success) {
    const errores = resultado.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Datos inválidos.", campos: errores },
      { status: 422 },
    );
  }

  const { nombre, telefono, fecha_nacimiento, correo, colonia } =
    resultado.data;

  // Supabase con service_role (nunca exponer al cliente)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Verificar teléfono duplicado
  const { data: existente } = await supabase
    .from("participantes")
    .select("folio")
    .eq("telefono", telefono)
    .maybeSingle();

  if (existente) {
    return NextResponse.json(
      {
        error: "Este número de teléfono ya está registrado.",
        folio: existente.folio, // Devolvemos el folio para recuperación
        yaRegistrado: true,
      },
      { status: 409 },
    );
  }

  // Insertar — el folio lo genera la BD con generar_folio()
  const { data: nuevo, error: errorInsert } = await supabase
    .from("participantes")
    .insert({
      nombre: nombre.trim(),
      telefono,
      fecha_nacimiento,
      correo: correo && correo.trim() !== "" ? correo.trim() : null,
      direccion: colonia.trim(), // columna 'direccion' en el schema
    })
    .select("folio, nombre, creado_en")
    .single();

  if (errorInsert || !nuevo) {
    console.error("[crear participante]", errorInsert);
    return NextResponse.json(
      { error: "Error al guardar el registro. Intenta de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      folio: nuevo.folio,
      nombre: nuevo.nombre,
      mensaje: "Registro exitoso",
    },
    { status: 201 },
  );
}
