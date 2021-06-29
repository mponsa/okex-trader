export class OkexRepositoryError extends Error {
    code: string;

    constructor(m: string, code: string) {
            super(m);
            this.code = code;
            Object.setPrototypeOf(this, OkexRepositoryError.prototype);
    }
}


export class TraderError extends Error {
    code: string;

    constructor(m: string, code: string) {
        super(m);
        this.code = code;
        Object.setPrototypeOf(this, TraderError.prototype);
    }
}