export default class TokenStorage {

    #tokenList = [];

    add(token) {
        const oldIdx = this.#tokenList.indexOf(token);
        if (oldIdx >= 0) {
            return oldIdx;
        }
        const idx = this.#tokenList.length;
        this.#tokenList.push(token);
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

}
