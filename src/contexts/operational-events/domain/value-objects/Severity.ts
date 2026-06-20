import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export enum SeverityLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

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

    if (!Object.values(SeverityLevel).includes(value as SeverityLevel)) {
      throw new Error(`Invalid severity level: ${value} must be one of ${Object.keys(SeverityLevel).join(", ")}`);
    }

    return new Severity({ value:  value as SeverityLevel });
  }

  get value(): SeverityLevel {
    return this.props.value;
  }

  isCritical(): boolean {
    return this.value === SeverityLevel.CRITICAL;
  }
}
