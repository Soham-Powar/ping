const errorHandler = (err, req, res, next) => {
  console.error("Error::", err);

  const statusCode = err.statusCode || 500;
  statusCode = Number(statusCode);
  if (Number.isNaN(statusCode)) statusCode = 500;

  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;
