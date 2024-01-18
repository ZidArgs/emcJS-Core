export default class UniqueEntriesStack {

    #entries = [];

    push(entry) {
        const index = this.#entries.indexOf(entry);
        if (index >= 0) {
            this.#entries.splice(index, 1);
        }
        this.#entries.push(entry);
    }

    pop() {
        return this.#entries.pop();
    }

    peek() {
        return this.#entries.at(-1);
    }

    has(entry) {
        return this.#entries.includes(entry);
    }

    delete(entry) {
        const index = this.#entries.indexOf(entry);
        if (index >= 0) {
            this.#entries.splice(index, 1);
        }
    }

}
