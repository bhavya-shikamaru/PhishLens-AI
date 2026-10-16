import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeRouter } from "./routes/analyze.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.disable("x-powered-by");
app.use(cors({ origin: process.env.NODE_ENV === "production" ? false : "http://localhost:5173" }));
app.use(express.json({ limit: "16kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "phishlens-api" }));
app.use("/api/analyze", analyzeRouter);

app.use((_req, res) => res.status(404).json({ error: "Endpoint not found." }));

app.listen(port, () => {
  console.log(`PhishLens API listening on http://localhost:${port}`);
});
