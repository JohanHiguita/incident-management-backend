import { AggregateRoot } from "../../../shared/domain/AggregateRoot.js";
import { UniqueEntityId } from "../../../shared/domain/UniqueEntityId.js";
import { AffectedApplication } from "./value-objects/AffectedApplication.js";
import { AlertSeverity } from "./value-objects/AlertSeverity.js";
import { ProcessingStatus } from "./value-objects/ProcessingStatus.js";

interface CreateAlertProps {
  sourceEventId: UniqueEntityId;
  affectedApplication: AffectedApplication;
  severity: AlertSeverity;
  generatedAt: Date;
  processingStatus: ProcessingStatus;
}

export class Alert extends AggregateRoot {
  private readonly sourceEventId: UniqueEntityId;
  private readonly affectedApplication: AffectedApplication;
  private readonly severity: AlertSeverity;
  private readonly generatedAt: Date;
  private readonly processingStatus: ProcessingStatus;

  private constructor(id: UniqueEntityId, props: CreateAlertProps) {
    super(id);
    this.sourceEventId = props.sourceEventId;
    this.affectedApplication = props.affectedApplication;
    this.severity = props.severity;
    this.generatedAt = props.generatedAt;
    this.processingStatus = props.processingStatus;
  }

  static createFromCriticalEvent(params: {
    sourceEventId: UniqueEntityId;
    affectedApplication: AffectedApplication;
    severity: AlertSeverity;
    generatedAt: Date;
  }): Alert {
    if (!params.severity.isCritical()) {
      throw new Error("Alert can only be created from CRITICAL events");
    }

    return new Alert(UniqueEntityId.create(), {
      ...params,
      processingStatus: ProcessingStatus.pending(),
    });
  }

  getSourceEventId(): UniqueEntityId {
    return this.sourceEventId;
  }

  getAffectedApplication(): AffectedApplication {
    return this.affectedApplication;
  }

  getSeverity(): AlertSeverity {
    return this.severity;
  }

  getGeneratedAt(): Date {
    return this.generatedAt;
  }

  getProcessingStatus(): ProcessingStatus {
    return this.processingStatus;
  }
}
