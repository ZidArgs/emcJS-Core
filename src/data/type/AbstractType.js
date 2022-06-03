/**
 * An abstract representation of datatype enforcer and converter classes.
 */
export default class AbstractType {

    #value;

    constructor(value) {
        if (new.target === AbstractType) {
            throw new Error("can not construct abstract class");
        }
        this.value = value;
    }

    set value(value) {
        this.#value = this.constructor.format(value);
    }

    get value() {
        return this.#value;
    }

    toString() {
        return this.#value.toString();
    }

    valueOf() {
        return this.#value.valueOf();
    }

    static format() {
        throw new Error("can not call abstract method");
    }

}
