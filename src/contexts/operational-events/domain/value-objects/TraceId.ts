import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: string;
}

export class TraceId extends ValueObject<Props> {
  private static readonly MAX_LENGTH = 128;

  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): TraceId {
    const value = raw.trim();

    if (!value) {
      throw new Error("TraceId cannot be empty");
    }

    if (value.length > TraceId.MAX_LENGTH) {
      throw new Error(
        `TraceId cannot be longer than ${TraceId.MAX_LENGTH} characters`,
      );
    }   

    return new TraceId({ value });
  }

  get value(): string {
    return this.props.value;
  }

}