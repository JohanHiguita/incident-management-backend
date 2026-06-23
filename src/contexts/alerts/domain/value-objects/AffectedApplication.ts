import {
  formatAllowedApplications,
  isAllowedApplication,
} from "../../../../shared/domain/AllowedApplications.js";
import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: string;
}

export class AffectedApplication extends ValueObject<Props> {
  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): AffectedApplication {
    const value = raw.trim();

    if (!value) {
      throw new Error("AffectedApplication cannot be empty");
    }

    if (!isAllowedApplication(value)) {
      throw new Error(
        `AffectedApplication ${value} is not allowed. Allowed values: ${formatAllowedApplications()}`,
      );
    }

    return new AffectedApplication({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
