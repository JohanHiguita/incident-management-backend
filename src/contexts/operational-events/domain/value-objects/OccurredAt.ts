import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: Date;
}

export class OccurredAt extends ValueObject<Props> {

  private static readonly MAX_FUTURE_ALLOWED = 5 * 60 * 1000; // 5 minutes

  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): OccurredAt {
    const value = new Date(raw);

    if (isNaN(value.getTime())) {
      throw new Error("OccurredAt is not a valid date");
    }

    if (value.getTime() > Date.now() + OccurredAt.MAX_FUTURE_ALLOWED) {
      throw new Error("OccurredAt cannot be in the future");
    }

    return new OccurredAt({ value });
  }

  get value(): Date {
    return this.props.value;
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}