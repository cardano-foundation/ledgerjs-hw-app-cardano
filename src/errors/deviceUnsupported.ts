import { ErrorBase } from "./errorBase";

// Tried to call a method with incompatible Ledger App version
export class DeviceVersionUnsupported extends ErrorBase {
    public constructor(reason: string) {
        super(reason)
    }
}