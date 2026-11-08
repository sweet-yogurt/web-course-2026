function sendError(res, error) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  const message =
    status === 500 ? "Внутренняя ошибка сервера" : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({ error: message });
}

module.exports = { sendError };
