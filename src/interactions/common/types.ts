export type SendParams = {
    ins: number;
    p1: number;
    p2: number;
    data: Buffer;
    expectedResponseLength?: number;
};

export type Interaction<RetValue> = Generator<SendParams, RetValue, Buffer>;