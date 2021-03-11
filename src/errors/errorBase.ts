// Base error for errors thrown by the code
export class ErrorBase extends Error {
    public constructor(message: string) {
        super(message)
        this.name = this.constructor.name
    }
}