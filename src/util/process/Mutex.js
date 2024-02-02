export default class Mutex {

    #queue = [];

    #locked = false;

    acquire() {
        return new Promise((resolve) => {
            if (!this.#locked && !this.#queue.length) {
                this.#locked = true;
                resolve();
            } else {
                this.#queue.push(resolve);
            }
        });
    }

    release() {
        if (this.#queue.length) {
            const next = this.#queue.shift();
            next();
        } else {
            this.#locked = false;
        }
    }

}
