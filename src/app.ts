import express from "express";
import operationalEventRoutes from "./contexts/operational-events/infrastructure/http/operationalEventRoutes.js";
import incidentRoutes from "./contexts/incidents/infrastructure/http/incidentRoutes.js";
import dashboardRoutes from "./contexts/dashboard/infrastructure/http/dashboardRoutes.js";
import { errorHandler } from "./shared/infraestructure/http/errorHandler.js";
import { registerSwagger } from "./shared/infrastructure/http/swagger.js";

const app = express();

app.use(express.json());

registerSwagger(app);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1", operationalEventRoutes);
app.use("/api/v1", incidentRoutes);
app.use("/api/v1", dashboardRoutes);

app.use(errorHandler);

export default app;