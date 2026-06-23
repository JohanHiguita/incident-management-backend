import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./openapi.js";

export function registerSwagger(app: Express): void {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: "Coordinadora API Docs",
    }),
  );
}
