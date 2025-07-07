export default class Counter {

    #value = -1;

    get next() {
        return ++this.#value;
    }

    get current() {
        return this.#value;
    }

}
