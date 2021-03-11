import { ErrorBase } from "../errors/errorBase"

export function assert(cond: boolean, errMsg: string): asserts cond {
    if (!cond) throw new ErrorBase('Assertion failed' + errMsg ? ': ' + errMsg : '')
}

export function unreachable(_val: never): never {
    assert(false, 'Unreachable code hit')
}
