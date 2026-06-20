import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: string;
}

export class SourceApplication extends ValueObject<Props> {

  static readonly ALLOWED_VALUES = [
    "payments-api", 
    "orders-api",
    "inventory-service", 
    "notifications-service", 
    "auth-service", 
    "billing-legacy", 
    "shipping-api", 
  ] as const;

  private static readonly ALLOWED = new Set<string>(
    SourceApplication.ALLOWED_VALUES,
  );

  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): SourceApplication {
    const value = raw.trim();

    if (!value) {
      throw new Error("SourceApplication cannot be empty");
    }


    if (!SourceApplication.ALLOWED.has(value)) {
      throw new Error(
        `SourceApplication ${value} is not allowed. Allowed values: ${SourceApplication.ALLOWED_VALUES.join(", ")}`,
      );
    }

    return new SourceApplication({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
