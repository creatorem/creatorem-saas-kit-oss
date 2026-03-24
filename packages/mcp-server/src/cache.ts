type CacheEntry<TValue> = {
    expiresAt: number;
    value: TValue;
};

export class TtlCache<TValue> {
    readonly #ttlMs: number;
    readonly #store = new Map<string, CacheEntry<TValue>>();

    constructor(ttlMs: number) {
        this.#ttlMs = ttlMs;
    }

    get(key: string): TValue | undefined {
        const entry = this.#store.get(key);
        if (!entry) {
            return undefined;
        }

        if (Date.now() >= entry.expiresAt) {
            this.#store.delete(key);
            return undefined;
        }

        return entry.value;
    }

    set(key: string, value: TValue) {
        this.#store.set(key, {
            expiresAt: Date.now() + this.#ttlMs,
            value,
        });
    }

    clear() {
        this.#store.clear();
    }
}
