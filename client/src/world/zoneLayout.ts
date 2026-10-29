import type { ZoneId } from '../types';

export interface ZoneVisual {
  id: ZoneId;
  name: string;
  emoji: string;
  color: string;
  position: [number, number];
  firstLessonOrder: number;
}

/** Debe coincidir con `server/src/content/datasets.ts` (ZONES). */
export const ZONE_VISUALS: ZoneVisual[] = [
  { id: 'playa', name: 'Playa de las Bases', emoji: '🏖️', color: '#38bdf8', position: [0, -16], firstLessonOrder: 0 },
  { id: 'pueblo', name: 'Pueblo de las Tablas', emoji: '🏘️', color: '#f59e0b', position: [13, -11], firstLessonOrder: 2 },
  { id: 'taller', name: 'Taller de los Tipos', emoji: '🛠️', color: '#a78bfa', position: [18, 0], firstLessonOrder: 3 },
  { id: 'cueva', name: 'Cueva del SELECT', emoji: '🕳️', color: '#64748b', position: [13, 11], firstLessonOrder: 6 },
  { id: 'bosque', name: 'Bosque del WHERE', emoji: '🌳', color: '#22c55e', position: [0, 16], firstLessonOrder: 7 },
  { id: 'puente', name: 'Puente del ORDER BY y LIMIT', emoji: '🌉', color: '#0ea5e9', position: [-13, 11], firstLessonOrder: 8 },
  { id: 'laboratorio', name: 'Laboratorio de Cambios', emoji: '🧪', color: '#f97316', position: [-18, 0], firstLessonOrder: 5 },
  { id: 'castillo', name: 'Castillo de las Relaciones', emoji: '🏰', color: '#e879f9', position: [-13, -11], firstLessonOrder: 10 },
  { id: 'templo', name: 'Templo del INNER JOIN', emoji: '⛩️', color: '#facc15', position: [0, -3], firstLessonOrder: 12 },
];

export const ZONE_BY_ID = new Map(ZONE_VISUALS.map((zone) => [zone.id, zone]));

export const ISLAND_RADIUS = 21;
export const ZONE_BLOCK_RADIUS = 3.1;
export const INTERACT_RADIUS = 4.6;

export function detectWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}
