export const TOKEN_MATCHER = /\{\{([0-9]+)\}\}/;

export const TOKEN_LITERAL_MATCHER = /^\{\{([0-9]+)\}\}$/;

export function toTokenLiteral(idx) {
    return `{{${idx}}}`;
}

export default class TokenStorage {

    #tokenList = [];

    #tokenMap = new Map();

    add(token) {
        const oldIdx = this.#tokenMap.get(token);
        if (oldIdx >= 0) {
            return oldIdx;
        }
        const match = TOKEN_LITERAL_MATCHER.exec(token);
        if (match != null) {
            const idx = parseInt(match[1]);
            return idx;
        }
        const idx = this.#tokenList.length;
        this.#tokenList.push(token);
        this.#tokenMap.set(token, idx);
        return idx;
    }

    at(idx) {
        return this.#tokenList.at(idx);
    }

    get(idx) {
        return this.#tokenList[idx];
    }

    [Symbol.iterator]() {
        return Iterator.from(this.#tokenList);
    }

    cleanup() {
        for (const index in this.#tokenList) {
            this.#cleanupToken(index);
        }
        // TODO rewrite resuts in reversed order, leave out empty elements
    }

    #cleanupToken(index) {
        const token = this.#tokenList[index];
        if (token != null) {
            const match = TOKEN_LITERAL_MATCHER.exec(token);
            if (match != null) {
                const idx = parseInt(match[1]);
                this.#tokenList[index] = this.#tokenList[idx];
                this.#tokenList[idx] = null;
                this.#cleanupToken(index);
            }
        }
    }

}
