/**
 * Error de aplicación: transporta el código HTTP, un código de error estable
 * para el cliente y detalles opcionales. El middleware de errores lo traduce
 * a la respuesta JSON uniforme del contrato.
 */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown[] = []
  ) {
    super(message);
  }
}
