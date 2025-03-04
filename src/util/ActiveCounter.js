export default class ActiveCounter {

    #count = 0;

    add() {
        if (this.#count++ == 0) {
            return true;
        }
        return false;
    }

    remove() {
        if (this.#count > 0 && --this.#count == 0) {
            return true;
        }
        return false;
    }

    reset() {
        if (this.#count > 0) {
            this.#count = 0;
            return true;
        }
        return false;
    }

    isActive() {
        return this.#count > 0;
    }

}
