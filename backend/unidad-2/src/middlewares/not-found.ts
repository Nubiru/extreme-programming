import type { RequestHandler } from "express";

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: { code: "RUTA_DESCONOCIDA", message: "La ruta solicitada no existe", details: [] }
  });
};
