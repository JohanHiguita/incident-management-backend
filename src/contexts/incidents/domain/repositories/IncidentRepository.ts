import type { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import type { Incident } from "../Incident.js";

export interface IncidentRepository {
  save(incident: Incident): Promise<void>;
  findById(id: UniqueEntityId): Promise<Incident | null>;
}