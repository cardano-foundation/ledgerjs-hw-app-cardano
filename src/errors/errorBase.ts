/**
 * Base error for errors thrown by the code
 * @category Errors
 */
export class ErrorBase extends Error {
  public constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
