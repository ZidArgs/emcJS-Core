export default class AbstractType {

    #value;

    constructor(value) {
        if (new.target === AbstractType) {
            throw new TypeError("can not construct abstract class");
        }
        this.value = value;
    }

    set value(value) {
        this.#value = this.constructor.format(value);
    }

    get value() {
        return this.#value;
    }

    static format() {
        throw new TypeError("can not call abstract method");
    }

}
