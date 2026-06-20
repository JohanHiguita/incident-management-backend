/**
 * UniqueEntityId is a value object that represents the unique identifier of an entity.
 * It is used to identify the entity and ensure that it is unique.
 */

import { randomUUID } from "node:crypto";

interface Props {
  value: string;
}

export class UniqueEntityId {
  private readonly props: Props;

  private constructor(props: Props) {
    
    if (!props.value) {
      throw new Error("UniqueEntityId cannot be empty");
    }

    this.props = Object.freeze(props);
  }

  static create(): UniqueEntityId {
    return new UniqueEntityId({ value: randomUUID() });
  }

  static fromString(value: string): UniqueEntityId {
    return new UniqueEntityId({ value });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other?: UniqueEntityId): boolean {
    if (!other) return false;
    return this.props.value === other.props.value;
  }

}