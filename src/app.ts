import express from "express";
import operationalEventRoutes from "./contexts/operational-events/infrastructure/http/operationalEventRoutes.js";
import { errorHandler } from "./shared/infraestructure/http/errorHandler.js";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", operationalEventRoutes);

app.use(errorHandler);

export default app;