import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
    value: string;
}

export class IncidentTitle extends ValueObject<Props> {
    private static readonly MAX_LENGTH = 200;

    private constructor(props: Props) {
        super(props);
    }
    
    static create(raw: string): IncidentTitle {
        const value = raw.trim();

        if (!value) {
            throw new Error("IncidentTitle cannot be empty");
        }

        if (value.length > IncidentTitle.MAX_LENGTH) {
            throw new Error(`IncidentTitle cannot be longer than ${IncidentTitle.MAX_LENGTH} characters`);
        }

        return new IncidentTitle({ value });
    }

    get value(): string {
        return this.props.value;
    }
}