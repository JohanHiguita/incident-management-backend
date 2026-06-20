import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: string;
}

export class EventType extends ValueObject<Props> {
  private static readonly MAX_LENGTH = 100;

  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): EventType {
    const value = raw.trim();

    if (!value) {
      throw new Error("EventType cannot be empty");
    }

    if (value.length > EventType.MAX_LENGTH) {
      throw new Error(
        `EventType cannot be longer than ${EventType.MAX_LENGTH} characters`,
      );
    }

    return new EventType({ value });
  }

  get value(): string {
    return this.props.value;
  }
}