import express from "express";
import operationalEventRoutes from "./contexts/operational-events/infrastructure/http/operationalEventRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/v1", operationalEventRoutes);

export default app;