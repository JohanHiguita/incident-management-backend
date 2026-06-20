import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: string;
}

export class EventDescription extends ValueObject<Props> {
  private static readonly MAX_LENGTH = 500;

  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): EventDescription {
    const value = raw.trim();

    if (!value) {
      throw new Error("EventDescription cannot be empty");
    }

    if (value.length > EventDescription.MAX_LENGTH) {
      throw new Error(
        `EventDescription cannot be longer than ${EventDescription.MAX_LENGTH} characters`,
      );
    }

    return new EventDescription({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
