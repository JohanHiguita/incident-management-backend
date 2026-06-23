import { AggregateRoot } from "../../../shared/domain/AggregateRoot.js";
import { UniqueEntityId } from "../../../shared/domain/UniqueEntityId.js";
import { IncidentTitle } from "./value-objects/IncidentTitle.js";
import { IncidentDescription } from "./value-objects/IncidentDescription.js";
import { IncidentStatus } from "./value-objects/IncidentStatus.js";
import { Severity } from "../../operational-events/domain/value-objects/Severity.js";
import { Assignee } from "./value-objects/Assignee.js";
import { AffectedApplication } from "./value-objects/AffectedApplication.js";

interface CreateIncidentProps {
  incidentTitle: IncidentTitle;
  incidentDescription: IncidentDescription;
  incidentStatus: IncidentStatus;
  severity: Severity;
  assignee: Assignee;
  affectedApplication: AffectedApplication;
  linkedEventIds: UniqueEntityId[];
  createdAt: Date;
}

export class Incident extends AggregateRoot {
  private readonly incidentTitle: IncidentTitle;
  private readonly incidentDescription: IncidentDescription;
  private incidentStatus: IncidentStatus;
  private readonly severity: Severity;
  private readonly assignee: Assignee;
  private readonly affectedApplication: AffectedApplication;
  private readonly linkedEventIds: UniqueEntityId[];
  private readonly createdAt: Date;
  private constructor(id: UniqueEntityId, props: CreateIncidentProps) {
    super(id);
    this.incidentTitle = props.incidentTitle;
    this.incidentDescription = props.incidentDescription;
    this.incidentStatus = props.incidentStatus;
    this.severity = props.severity;
    this.assignee = props.assignee;
    this.affectedApplication = props.affectedApplication;
    this.linkedEventIds = [...props.linkedEventIds];
    this.createdAt = props.createdAt;
  }

  static create(
    params: Omit<CreateIncidentProps, "incidentStatus" | "createdAt">
  ): Incident {
    if (params.linkedEventIds.length === 0) {
      throw new Error("Incident must be linked to at least one event");
    }

    const id = UniqueEntityId.create();

    return new Incident(id, {
      ...params,
      incidentStatus: IncidentStatus.create("OPEN"),
      createdAt: new Date(),
    });
  }

  static reconstitute(
    id: UniqueEntityId,
    props: CreateIncidentProps,
  ): Incident {
    return new Incident(id, props);
  }

  updateStatus(newStatus: IncidentStatus): void {
    if (!this.incidentStatus.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.incidentStatus.value} to ${newStatus.value}`,
      );
    }

    this.incidentStatus = newStatus;
  }

  getIncidentTitle(): IncidentTitle {
    return this.incidentTitle;
  }

  getIncidentDescription(): IncidentDescription {
    return this.incidentDescription;
  }

  getIncidentStatus(): IncidentStatus {
    return this.incidentStatus;
  }

  getSeverity(): Severity {
    return this.severity;
  }

  getAssignee(): Assignee {
    return this.assignee;
  }

  getAffectedApplication(): AffectedApplication {
    return this.affectedApplication;
  }

  getLinkedEventIds(): UniqueEntityId[] {
    return [...this.linkedEventIds];
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
