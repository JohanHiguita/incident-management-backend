import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
    value: string;
}

export class IncidentDescription extends ValueObject<Props> {
    private static readonly MAX_LENGTH = 2000;

    private constructor(props: Props) {
        super(props);
    }
    
    static create(raw: string): IncidentDescription {
        const value = raw.trim();

        if (!value) {
            throw new Error("IncidentDescription cannot be empty");
        }

        if (value.length > IncidentDescription.MAX_LENGTH) {
            throw new Error(`IncidentDescription cannot be longer than ${IncidentDescription.MAX_LENGTH} characters`);
        }

        return new IncidentDescription({ value });
    }

    get value(): string {
        return this.props.value;
    }
}