import { ValueObject } from "../../../../shared/domain/ValueObject.js";

interface Props {
    value: string;
}

export class Assignee extends ValueObject<Props> {
    private static readonly MAX_LENGTH = 100;

    private constructor(props: Props) {
        super(props);
    }
    
    static create(raw: string): Assignee {
        const value = raw.trim();

        if (!value) {
            throw new Error("Assignee cannot be empty");
        }

        if (value.length > Assignee.MAX_LENGTH) {
            throw new Error(`Assignee cannot be longer than ${Assignee.MAX_LENGTH} characters`);
        }

        return new Assignee({ value });
    }

    get value(): string {
        return this.props.value;
    }
}