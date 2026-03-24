export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class UpstreamUnavailableError extends Error {
    readonly status?: number;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'UpstreamUnavailableError';
        this.status = status;
    }
}
