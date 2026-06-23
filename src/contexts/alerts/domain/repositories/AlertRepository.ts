import type { Alert } from "../Alert.js";

export interface AlertRepository {
  save(alert: Alert): Promise<void>;
}
