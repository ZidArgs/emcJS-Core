export default class ActiveCounter extends EventTarget {

    #count = 0;

    add() {
        if (this.#count++ == 0) {
            const event = new Event("active");
            event.data = true;
            this.dispatchEvent(event);
        }
    }

    remove() {
        if (this.#count > 0 && --this.#count == 0) {
            const event = new Event("active");
            event.data = false;
            this.dispatchEvent(event);
        }
    }

}
