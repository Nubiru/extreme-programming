import type { ErrorRequestHandler } from "express";
import { AppError } from "../errors/app-error.ts";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details }
    });
    return;
  }

  // express.json() lanza SyntaxError con status 400 cuando el cuerpo no es JSON válido.
  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    response.status(400).json({
      error: { code: "JSON_INVALIDO", message: "El cuerpo no es JSON válido", details: [] }
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: { code: "ERROR_INTERNO", message: "Ocurrió un error interno", details: [] }
  });
};
