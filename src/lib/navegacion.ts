// src/lib/navegacion.ts
//
// Lógica centralizada de navegación post-folio.
// Usado desde /, /quiniela y RecuperarFolioModal.
// Un solo lugar para cambiar el comportamiento de redirección.

export interface EstadoParticipante {
  folio: string;
  nombre: string;
  fase_activa: { orden: number; nombre: string } | null;
  ya_participo: boolean;
}

/**
 * Determina la ruta destino basándose en el estado del participante.
 * Retorna "/" si no hay fase activa (sin navegación).
 */
export function decidirDestino(estado: EstadoParticipante): string {
  if (!estado.fase_activa) return "/";
  if (estado.ya_participo) return "/mis-pronosticos";
  return `/fase/${estado.fase_activa.orden}`;
}

/**
 * Llama al endpoint consolidado y retorna el estado del participante.
 * Lanza error si el folio no existe o la red falla.
 */
export async function obtenerEstado(
  folio: string,
): Promise<EstadoParticipante> {
  const res = await fetch("/api/participantes/estado", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folio }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "Error al verificar el folio.");
  }

  return data as EstadoParticipante;
}
