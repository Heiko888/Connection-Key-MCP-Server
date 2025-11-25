/**
 * Error Handler Middleware
 */

export const errorHandler = (err, req, res, next) => {
  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Standard Error Response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Interner Serverfehler";

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err
    })
  });
};

