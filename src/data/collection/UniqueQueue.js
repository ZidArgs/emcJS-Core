export default class UniqueQueue {

    #queue = [];

    enqueue(value) {
        if (!this.#queue.includes(value)) {
            this.#queue.push(value);
        }
    }

    dequeue() {
        return this.#queue.shift();
    }

    peek() {
        return this.#queue.at(0);
    }

    clear() {
        this.#queue = [];
    }

    get length() {
        return this.#queue.length;
    }

    toArray() {
        return [...this.#queue];
    }

}
