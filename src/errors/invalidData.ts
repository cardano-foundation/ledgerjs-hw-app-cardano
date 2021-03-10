import { ErrorBase } from "./errorBase";
import type { InvalidDataReason } from "./invalidDataReason";

// Request data is invalid, caller should check what is feeding to us
export class InvalidData extends ErrorBase {
    public constructor(reason: InvalidDataReason) {
        super(reason)
    }
}

