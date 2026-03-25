export function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.originalUrl}` });
}

export function errorHandler(error, request, response, next) {
  const statusCode = response.statusCode >= 400 ? response.statusCode : 500;
  response.status(statusCode).json({
    message: error.message || "Server error",
  });
}
