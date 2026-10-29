export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly publicMessage: string;
  readonly details?: unknown;

  constructor(status: number, code: string, publicMessage: string, details?: unknown) {
    super(publicMessage);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.publicMessage = publicMessage;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'bad_request', message, details);

export const unauthorized = (message = 'Necesitas iniciar sesión.') =>
  new AppError(401, 'unauthorized', message);

export const forbidden = (message = 'No tienes permiso para hacer esto.') =>
  new AppError(403, 'forbidden', message);

export const notFound = (message = 'No encontramos eso.') => new AppError(404, 'not_found', message);

export const conflict = (message: string) => new AppError(409, 'conflict', message);

export const tooManyRequests = (message = 'Demasiados intentos. Espera un momento.') =>
  new AppError(429, 'rate_limited', message);
