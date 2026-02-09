import { StatusCodes } from "http-status-codes";

export const errorHandlerMiddleware = (err, req, res, next) => {
  // Si el error es uno de tus errores personalizados
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
  }

  // Errores de JWT (por si se escapa alguno)
  if (err.name === "JsonWebTokenError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "InvalidToken",
      message: "Token inválido",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: "TokenExpired",
      message: "El token ha expirado",
    });
  }

  // Cualquier otro error inesperado
  console.error("ERROR NO CONTROLADO:", err);

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: "InternalServerError",
    message: "Algo salió mal en el servidor",
  });
};
