import type { TableDef, Zone } from './types.js';

/**
 * Datos ficticios y diminutos. Son la única fuente de verdad para las
 * consultas didácticas: el niño nunca ejecuta SQL libre contra MySQL.
 */
export const TABLES: Record<string, TableDef> = {
  juguetes: {
    name: 'juguetes',
    label: 'Caja de juguetes',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'id', type: 'numero' },
      { key: 'nombre', label: 'nombre', type: 'texto' },
      { key: 'tipo', label: 'tipo', type: 'texto' },
      { key: 'color', label: 'color', type: 'texto' },
      { key: 'precio', label: 'precio', type: 'numero' },
    ],
    rows: [
      { id: 1, nombre: 'Tito', tipo: 'dinosaurio', color: 'verde', precio: 12 },
      { id: 2, nombre: 'Luna', tipo: 'pelota', color: 'azul', precio: 8 },
      { id: 3, nombre: 'Max', tipo: 'robot', color: 'rojo', precio: 25 },
      { id: 4, nombre: 'Nube', tipo: 'peluche', color: 'blanco', precio: 15 },
      { id: 5, nombre: 'Rayo', tipo: 'carro', color: 'amarillo', precio: 20 },
    ],
  },
  frutas: {
    name: 'frutas',
    label: 'Cesta de frutas',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'id', type: 'numero' },
      { key: 'nombre', label: 'nombre', type: 'texto' },
      { key: 'color', label: 'color', type: 'texto' },
      { key: 'precio', label: 'precio', type: 'numero' },
    ],
    rows: [
      { id: 1, nombre: 'manzana', color: 'rojo', precio: 2 },
      { id: 2, nombre: 'plátano', color: 'amarillo', precio: 1 },
      { id: 3, nombre: 'uva', color: 'morado', precio: 3 },
      { id: 4, nombre: 'pera', color: 'verde', precio: 2 },
    ],
  },
  mascotas: {
    name: 'mascotas',
    label: 'mascotas',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'id', type: 'numero' },
      { key: 'nombre', label: 'nombre', type: 'texto' },
      { key: 'especie', label: 'especie', type: 'texto' },
      { key: 'id_dueno', label: 'id_dueno', type: 'numero' },
    ],
    rows: [
      { id: 1, nombre: 'Michi', especie: 'gato', id_dueno: 1 },
      { id: 2, nombre: 'Firulais', especie: 'perro', id_dueno: 2 },
      { id: 3, nombre: 'Copito', especie: 'conejo', id_dueno: 2 },
      { id: 4, nombre: 'Nube', especie: 'hámster', id_dueno: 3 },
      { id: 5, nombre: 'Tino', especie: 'tortuga', id_dueno: 9 },
    ],
  },
  duenos: {
    name: 'duenos',
    label: 'dueños',
    primaryKey: 'id',
    columns: [
      { key: 'id', label: 'id', type: 'numero' },
      { key: 'nombre', label: 'nombre', type: 'texto' },
      { key: 'ciudad', label: 'ciudad', type: 'texto' },
    ],
    rows: [
      { id: 1, nombre: 'Ana', ciudad: 'Villa Sol' },
      { id: 2, nombre: 'Beto', ciudad: 'Puerto Luna' },
      { id: 3, nombre: 'Carla', ciudad: 'Cerro Verde' },
    ],
  },
};

export const ZONES: Zone[] = [
  { id: 'playa', name: 'Playa de las Bases', subtitle: 'Qué es una base de datos', emoji: '🏖️', color: '#38bdf8', position: [0, -16], firstLessonOrder: 0 },
  { id: 'pueblo', name: 'Pueblo de las Tablas', subtitle: 'Tablas, filas y columnas', emoji: '🏘️', color: '#f59e0b', position: [13, -11], firstLessonOrder: 2 },
  { id: 'taller', name: 'Taller de los Tipos', subtitle: 'Texto, números y fechas', emoji: '🛠️', color: '#a78bfa', position: [18, 0], firstLessonOrder: 3 },
  { id: 'cueva', name: 'Cueva del SELECT', subtitle: 'Elegir qué datos ver', emoji: '🕳️', color: '#64748b', position: [13, 11], firstLessonOrder: 6 },
  { id: 'bosque', name: 'Bosque del WHERE', subtitle: 'Filtrar con una condición', emoji: '🌳', color: '#22c55e', position: [0, 16], firstLessonOrder: 7 },
  { id: 'puente', name: 'Puente del ORDER BY y LIMIT', subtitle: 'Ordenar y recortar', emoji: '🌉', color: '#0ea5e9', position: [-13, 11], firstLessonOrder: 8 },
  { id: 'laboratorio', name: 'Laboratorio de Cambios', subtitle: 'INSERT, UPDATE y DELETE', emoji: '🧪', color: '#f97316', position: [-18, 0], firstLessonOrder: 5 },
  { id: 'castillo', name: 'Castillo de las Relaciones', subtitle: 'Claves primarias y foráneas', emoji: '🏰', color: '#e879f9', position: [-13, -11], firstLessonOrder: 10 },
  { id: 'templo', name: 'Templo del INNER JOIN', subtitle: 'Unir dos tablas', emoji: '⛩️', color: '#facc15', position: [0, -3], firstLessonOrder: 12 },
];

export const LAB_SEED_TOYS = [
  { nombre: 'Dino', tipo: 'dinosaurio', color: 'verde', precio: 12 },
  { nombre: 'Pelota', tipo: 'pelota', color: 'azul', precio: 8 },
  { nombre: 'Robot', tipo: 'robot', color: 'rojo', precio: 25 },
  { nombre: 'Osito', tipo: 'peluche', color: 'blanco', precio: 15 },
];

export const TOY_TYPES = ['dinosaurio', 'pelota', 'robot', 'peluche', 'carro', 'bloques'];
export const TOY_COLORS = ['verde', 'azul', 'rojo', 'blanco', 'amarillo', 'morado'];
