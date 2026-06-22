import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export enum IncidentStatusLevel {
    OPEN = "OPEN",
    IN_PROGRESS = "IN_PROGRESS",
    RESOLVED = "RESOLVED",
    CLOSED = "CLOSED",
}

const ALLOWED_TRANSITIONS: Record<IncidentStatusLevel, IncidentStatusLevel[]> = {
    [IncidentStatusLevel.OPEN]: [IncidentStatusLevel.IN_PROGRESS, IncidentStatusLevel.RESOLVED],
    [IncidentStatusLevel.IN_PROGRESS]: [IncidentStatusLevel.RESOLVED],
    [IncidentStatusLevel.RESOLVED]: [IncidentStatusLevel.CLOSED],
    [IncidentStatusLevel.CLOSED]: [],
} as const;

interface Props {
    value: IncidentStatusLevel;
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

        if (!Object.values(IncidentStatusLevel).includes(value as IncidentStatusLevel)) {
            throw new Error(`Invalid incident status level: ${value} must be one of ${Object.values(IncidentStatusLevel).join(", ")}`);
        }

        return new IncidentStatus({ value: value as IncidentStatusLevel });
    }

    get value(): IncidentStatusLevel {
        return this.props.value;
    }

    canTransitionTo(next: IncidentStatus): boolean { 
        return ALLOWED_TRANSITIONS[this.props.value].includes(next.value);
    }
}