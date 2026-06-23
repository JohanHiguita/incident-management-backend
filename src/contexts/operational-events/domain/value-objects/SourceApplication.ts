import {
  ALLOWED_APPLICATIONS,
  formatAllowedApplications,
  isAllowedApplication,
} from "../../../../shared/domain/AllowedApplications.js";
import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
  value: string;
}

export class SourceApplication extends ValueObject<Props> {
  static readonly ALLOWED_VALUES = ALLOWED_APPLICATIONS;

  private constructor(props: Props) {
    super(props);
  }

  static create(raw: string): SourceApplication {
    const value = raw.trim();

    if (!value) {
      throw new Error("SourceApplication cannot be empty");
    }

    if (!isAllowedApplication(value)) {
      throw new Error(
        `SourceApplication ${value} is not allowed. Allowed values: ${formatAllowedApplications()}`,
      );
    }

    return new SourceApplication({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
