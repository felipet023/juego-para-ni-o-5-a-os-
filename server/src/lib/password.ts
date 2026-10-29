import bcrypt from 'bcryptjs';

/**
 * Coste de bcrypt. 12 es el valor recomendado para producción; bajarlo
 * acelera el desarrollo pero debilita la resistencia a fuerza bruta.
 */
const ROUNDS = 12;

/** Hash de relleno para igualar tiempos cuando el usuario no existe. */
export const DUMMY_HASH = '$2b$12$/ycoufKtzC3VrEyvLOvkMuLlWjqZVIFhiI4Sq5HTGBH.vtt/vZzDK';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
