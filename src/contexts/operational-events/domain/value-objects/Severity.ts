import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export enum SeverityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

const ALLOWED_LEVELS = Object.values(SeverityLevel);

interface Props {
  value: SeverityLevel;
}

export class Severity extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): Severity {
    const value = raw.trim().toUpperCase();

    if (!value) {
      throw new Error("Severity cannot be empty");
    }

    if (!ALLOWED_LEVELS.includes(value as SeverityLevel)) {
      throw new Error(
        `Invalid severity level: ${value} must be one of ${ALLOWED_LEVELS.join(", ")}`,
      );
    }

    return new Severity({ value: value as SeverityLevel });
  }

  get value(): SeverityLevel {
    return this.props.value;
  }

  isCritical(): boolean {
    return this.value === SeverityLevel.CRITICAL;
  }
}
