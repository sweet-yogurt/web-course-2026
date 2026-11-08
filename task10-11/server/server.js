const express = require("express");
const cors = require("cors");

const categoriesRouter = require("./routes/categories");
const transactionsRouter = require("./routes/transactions");
const { sendError } = require("./lib/http");

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.use("/categories", categoriesRouter);
app.use("/transactions", transactionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ error: "Некорректный JSON в теле запроса" });
    return;
  }

  sendError(res, err);
});

app.listen(PORT, () => {
  console.log(`Zen-Money API: http://localhost:${PORT}`);
});
