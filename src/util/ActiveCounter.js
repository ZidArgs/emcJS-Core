const COUNT = new WeakMap();

export default class ActiveCounter extends EventTarget {

    constructor() {
        super();
        COUNT.set(this, 0);
    }

    add() {
        let count = COUNT.get(this);
        if (count++ == 0) {
            const event = new Event("active");
            event.data = true;
            this.dispatchEvent(event);
        }
        COUNT.set(this, count);
    }

    remove() {
        let count = COUNT.get(this);
        if (count > 0 && --count == 0) {
            const event = new Event("active");
            event.data = false;
            this.dispatchEvent(event);
        }
        COUNT.set(this, count);
    }

}
