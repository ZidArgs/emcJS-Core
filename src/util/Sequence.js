const QUEUE = new WeakMap();

export default class Sequence {

    constructor()  {
        QUEUE.set(this, Promise.resolve());
    }

    next(callback) {
        if (typeof callback == "function") {
            const queue = QUEUE.set(this);
            QUEUE.set(this, queue.then(callback));
        }
        return this;
    }

    static next(callback) {
        return (new Sequence()).next(callback);
    }

}
