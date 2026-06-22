import { ValueObject } from "../../../../shared/domain/ValueObject.js";
import { SourceApplication } from "../../../operational-events/domain/value-objects/SourceApplication.js";

interface Props {
    value: string;
}

export class AffectedApplication extends ValueObject<Props> {
    private static readonly ALLOWED = new Set<string>(
        SourceApplication.ALLOWED_VALUES,
    );

    private constructor(props: Props) {
        super(props);
    }

    static create(raw: string): AffectedApplication {
        const value = raw.trim();

        if (!value) {
            throw new Error("AffectedApplication cannot be empty");
        }

        if (!AffectedApplication.ALLOWED.has(value)) {
            throw new Error(
                `AffectedApplication ${value} is not allowed. Allowed values: ${SourceApplication.ALLOWED_VALUES.join(", ")}`,
            );
        }

        return new AffectedApplication({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
