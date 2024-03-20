export default class UniqueQueue {

    #queue = [];

    #index = new Set();

    enqueue(value) {
        if (!this.#index.has(value)) {
            this.#index.add(value);
            this.#queue.push(value);
        }
    }

    dequeue() {
        const value = this.#queue.shift();
        this.#index.delete(value);
        return value;
    }

    clear() {
        this.#queue = [];
        this.#index.clear();
    }

}
