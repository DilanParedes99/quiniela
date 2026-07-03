// src/lib/navegacion.ts
//
// Lógica centralizada de navegación post-folio.
// Usado desde /, /quiniela y RecuperarFolioModal.
// Un solo lugar para cambiar el comportamiento de redirección.

export interface EstadoParticipante {
  folio: string;
  nombre: string;
  fase_activa: {
    orden: number;
    nombre: string;
    registro_cierra_en: string;
  } | null;
  ya_participo: boolean;
}

/**
 * Determina la ruta destino basándose en el estado del participante.
 *
 * Casos:
 * - Sin fase activa → "/" (mensaje informativo en inicio)
 * - Fase activa pero período de captura vencido → "/" (el admin aún
 *   no ha cambiado el estado a 'cerrada'; no tiene sentido mandar
 *   al usuario a ver PantallaFaseCerrada)
 * - Ya participó en la fase activa → "/mis-pronosticos"
 * - No ha participado y fase vigente → "/fase/[orden]"
 */
export function decidirDestino(estado: EstadoParticipante): string {
  if (!estado.fase_activa) return "/";

  const ahora = new Date();
  const cierre = new Date(estado.fase_activa.registro_cierra_en);
  const faseVencida = ahora > cierre;

  // Fase en 'abierta' pero el período de captura ya cerró.
  // El admin actualizará el estado manualmente — mientras tanto
  // no tiene sentido redirigir al usuario a una pantalla de error.
  if (faseVencida) return "/";

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
