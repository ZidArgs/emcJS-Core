const VALUE = new WeakMap;

export default class AbstractType {

    constructor(value) {
        if (new.target === AbstractType) {
            throw new TypeError("can not construct abstract class");
        }
        this.value = value;
    }

    set value(value) {
        VALUE.set(this, this.constructor.format(value));
    }

    get value() {
        return VALUE.get(this);
    }

    toString() {
        return this.value.toString();
    }

    valueOf() {
        return this.value;
    }

    toJSON() {
        return this.value;
    }

    static format() {
        throw new TypeError("can not call abstract method");
    }

}
