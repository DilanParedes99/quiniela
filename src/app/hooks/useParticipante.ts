// src/app/hooks/useParticipante.ts
"use client";
import { useState, useEffect } from "react";

export interface Participante {
  folio: string;
  nombre: string;
}

const CLAVE = "mj_participante";

export function useParticipante() {
  const [participante, setParticipanteState] = useState<Participante | null>(
    null,
  );
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) setParticipanteState(JSON.parse(raw));
    } catch {
      localStorage.removeItem(CLAVE);
    } finally {
      setCargado(true);
    }
  }, []);

  function guardar(p: Participante) {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(p));
      setParticipanteState(p);
    } catch {
      // Safari privado con cuota llena — falla silencioso
      setParticipanteState(p);
    }
  }

  function limpiar() {
    try {
      localStorage.removeItem(CLAVE);
    } catch {}
    setParticipanteState(null);
  }

  return { participante, guardar, limpiar, cargado };
}
