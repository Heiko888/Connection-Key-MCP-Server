/**
 * Request Logger Middleware
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Response beenden, um Logging nach Response zu machen
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;

    console.log({
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent")
    });

    originalEnd.apply(res, args);
  };

  next();
};

