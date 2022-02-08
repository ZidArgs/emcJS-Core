export default class Sequence {

    #queue;

    constructor()  {
        this.#queue = Promise.resolve();
    }

    next(callback) {
        if (typeof callback == "function") {
            this.#queue.then(callback);
        }
        return this;
    }

    static next(callback) {
        return (new Sequence()).next(callback);
    }

}
