import {
  formatIncidentStatusValues,
  isIncidentStatus,
  type IncidentStatusValue,
} from "../../../../shared/domain/IncidentStatusValues.js";
import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export type IncidentStatusLevel = IncidentStatusValue;

const ALLOWED_TRANSITIONS: Record<IncidentStatusValue, IncidentStatusValue[]> = {
  OPEN: ["IN_PROGRESS", "RESOLVED"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

interface Props {
  value: IncidentStatusValue;
}

export class IncidentStatus extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): IncidentStatus {
    const value = raw.trim().toUpperCase();

    if (!value) {
      throw new Error("IncidentStatus cannot be empty");
    }

    if (!isIncidentStatus(value)) {
      throw new Error(
        `Invalid incident status level: ${value} must be one of ${formatIncidentStatusValues()}`,
      );
    }

    return new IncidentStatus({ value });
  }

  get value(): IncidentStatusValue {
    return this.props.value;
  }

  canTransitionTo(next: IncidentStatus): boolean {
    return ALLOWED_TRANSITIONS[this.props.value].includes(next.value);
  }
}
