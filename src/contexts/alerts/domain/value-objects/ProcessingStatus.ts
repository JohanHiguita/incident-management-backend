import { ValueObject } from "../../../../shared/domain/ValueObject.js";

export enum ProcessingStatusLevel {
  PENDING = "PENDING",
  PROCESSED = "PROCESSED",
}

interface Props {
  value: ProcessingStatusLevel;
}

export class ProcessingStatus extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): ProcessingStatus {
    const value = raw.trim().toUpperCase();

    if (!value) {
      throw new Error("ProcessingStatus cannot be empty");
    }

    if (!Object.values(ProcessingStatusLevel).includes(value as ProcessingStatusLevel)) {
      throw new Error(
        `Invalid processing status: ${value} must be one of ${Object.values(ProcessingStatusLevel).join(", ")}`,
      );
    }

    return new ProcessingStatus({ value: value as ProcessingStatusLevel });
  }

  static pending(): ProcessingStatus {
    return new ProcessingStatus({ value: ProcessingStatusLevel.PENDING });
  }

  get value(): ProcessingStatusLevel {
    return this.props.value;
  }
}
