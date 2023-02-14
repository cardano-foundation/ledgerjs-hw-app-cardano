import { ErrorBase } from "../errors/errorBase"

export function assert(cond: boolean, errMsg: string): asserts cond {
    const msg = errMsg ? `: ${errMsg}` : ''
    if (!cond) throw new ErrorBase(`Assertion failed${msg}`)
}

export function unreachable(_val: never): never {
    assert(false, 'Unreachable code hit')
}
