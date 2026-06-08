// src/app/api/pronosticos/crear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const esquemaPronostico = z.object({
  partido_id: z.string().uuid(),
  goles_local: z.number().int().min(0).max(30),
  goles_visita: z.number().int().min(0).max(30),
});

const esquemaBody = z.object({
  folio: z.string().regex(/^MJ-[A-Z2-9]{4}$/),
  fase_orden: z.number().int().min(1).max(4),
  pronosticos: z.array(esquemaPronostico).min(1),
});

export async function POST(req: NextRequest) {
  // Leer multipart/form-data (foto + JSON)
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const fotoFile = formData.get("foto") as File | null;
  const bodyRaw = formData.get("datos") as string | null;

  if (!fotoFile || !bodyRaw) {
    return NextResponse.json(
      { error: "Se requieren los datos y la foto." },
      { status: 400 },
    );
  }

  // Validar tipo de archivo
  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  if (!tiposPermitidos.includes(fotoFile.type)) {
    return NextResponse.json(
      { error: "La foto debe ser una imagen (JPG, PNG, WEBP)." },
      { status: 422 },
    );
  }

  // Validar tamaño (máx 10MB)
  if (fotoFile.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "La foto no debe superar 10MB." },
      { status: 422 },
    );
  }

  // Parsear y validar body JSON
  let body: unknown;
  try {
    body = JSON.parse(bodyRaw);
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const resultado = esquemaBody.safeParse(body);
  if (!resultado.success) {
    return NextResponse.json(
      {
        error: "Datos inválidos.",
        campos: resultado.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const { folio, fase_orden, pronosticos } = resultado.data;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Verificar folio y obtener participante
  const { data: participante } = await supabase
    .from("participantes")
    .select("id, folio")
    .eq("folio", folio)
    .maybeSingle();

  if (!participante) {
    return NextResponse.json({ error: "Folio no válido." }, { status: 403 });
  }

  // 2. Verificar fase abierta
  const { data: fase } = await supabase
    .from("fases")
    .select("id, estado, total_partidos")
    .eq("orden", fase_orden)
    .maybeSingle();

  if (!fase || fase.estado !== "abierta") {
    return NextResponse.json(
      { error: "Esta fase no está abierta para pronósticos." },
      { status: 403 },
    );
  }

  // 3. Verificar que no tenga registro previo en esta fase
  const { data: registroExistente } = await supabase
    .from("registros")
    .select("id")
    .eq("participante_id", participante.id)
    .eq("fase_id", fase.id)
    .maybeSingle();

  if (registroExistente) {
    return NextResponse.json(
      { error: "Ya enviaste tus pronósticos para esta fase." },
      { status: 409 },
    );
  }

  // 4. Verificar que los partido_ids pertenecen a esta fase
  const partidoIds = pronosticos.map((p) => p.partido_id);
  const { data: partidosValidos } = await supabase
    .from("partidos")
    .select("id")
    .eq("fase_id", fase.id)
    .in("id", partidoIds);

  if (!partidosValidos || partidosValidos.length !== pronosticos.length) {
    return NextResponse.json(
      { error: "Algunos partidos no pertenecen a esta fase." },
      { status: 422 },
    );
  }

  // 5. Subir foto a Storage PRIMERO (si falla, no se crea el registro)
  const extension = fotoFile.name.split(".").pop() ?? "jpg";
  const rutaFoto = `${participante.id}/${fase.id}_${Date.now()}.${extension}`;
  const arrayBuffer = await fotoFile.arrayBuffer();

  const { error: errorFoto } = await supabase.storage
    .from("fotos-quiniela")
    .upload(rutaFoto, arrayBuffer, {
      contentType: fotoFile.type,
      upsert: false,
    });

  if (errorFoto) {
    console.error("[subir foto]", errorFoto);
    return NextResponse.json(
      { error: "Error al subir la foto. Intenta de nuevo." },
      { status: 500 },
    );
  }

  // 6. Crear registro (foto ya subida exitosamente)
  const { data: registro, error: errorRegistro } = await supabase
    .from("registros")
    .insert({
      participante_id: participante.id,
      fase_id: fase.id,
      foto_url: rutaFoto,
      foto_estado: "pendiente",
    })
    .select("id")
    .single();

  if (errorRegistro || !registro) {
    // Intentar limpiar la foto subida
    await supabase.storage.from("fotos-quiniela").remove([rutaFoto]);
    console.error("[crear registro]", errorRegistro);
    return NextResponse.json(
      { error: "Error al guardar el registro. Intenta de nuevo." },
      { status: 500 },
    );
  }

  // 7. Insertar pronósticos
  const pronosticosInsert = pronosticos.map((p) => ({
    registro_id: registro.id,
    partido_id: p.partido_id,
    goles_local_predichos: p.goles_local,
    goles_visita_predichos: p.goles_visita,
  }));

  const { error: errorPronosticos } = await supabase
    .from("pronosticos")
    .insert(pronosticosInsert);

  if (errorPronosticos) {
    // Limpiar registro y foto si fallan los pronósticos
    await supabase.from("registros").delete().eq("id", registro.id);
    await supabase.storage.from("fotos-quiniela").remove([rutaFoto]);
    console.error("[insertar pronosticos]", errorPronosticos);
    return NextResponse.json(
      { error: "Error al guardar los pronósticos. Intenta de nuevo." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      mensaje: "Pronósticos enviados correctamente.",
      registro_id: registro.id,
    },
    { status: 201 },
  );
}
