import { UniqueEntityId } from "../../../../shared/domain/UniqueEntityId.js";
import type { OperationalEvent } from "../OperationalEvent.js";
import type { TraceId } from "../value-objects/TraceId.js";


export interface OperationalEventRepository {
  save(operationalEvent: OperationalEvent): Promise<void>;
  existsByTraceId(traceId: TraceId): Promise<boolean>;
  findByIds(ids: UniqueEntityId[]): Promise<OperationalEvent[]>;
}

