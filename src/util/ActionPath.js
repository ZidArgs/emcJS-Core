export default class ActionPath {

    #actions = [];

    #pointer = -1;

    constructor() {
        this.clear();
    }

    put(step) {
        if (++this.#pointer < this.#actions.length - 1) {
            this.#actions = this.#actions.slice(0, this.#pointer);
        }
        this.#actions[this.#pointer] = step;
        return this;
    }

    clear() {
        this.#actions = [];
        this.#pointer = -1;
    }

    redo() {
        if (this.#actions.length > 0 && this.#pointer < this.#actions.length - 1) {
            return this.#actions[++this.#pointer];
        }
    }

    undo() {
        if (this.#actions.length > 0 && this.#pointer >= 0) {
            return this.#actions[--this.#pointer];
        }
    }

    current() {
        return this.#actions[this.#pointer];
    }

    peek(offset) {
        const pos = this.#pointer + offset;
        if (pos < 0 || pos >= this.#actions.length) {
            return null;
        }
        return this.#actions[pos];
    }

    getState() {
        const res = [];
        for (const entry of this.#actions) {
            res.push(entry);
        }
        return {
            actions: res,
            pointer: this.#pointer,
            current: this.#actions[this.#pointer]
        };
    }

}
