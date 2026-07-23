export default class MouseMoveDelta extends EventTarget {

    #fromX;

    #fromY;

    #toX;

    #toY;

    #timer;

    get fromX() {
        return this.#fromX;
    }

    get fromY() {
        return this.#fromY;
    }

    get toX() {
        return this.#toX;
    }

    get toY() {
        return this.#toY;
    }

    get deltaX() {
        return this.toX - this.fromX;
    }

    get deltaY() {
        return this.toY - this.fromY;
    }

    startAt(x, y) {
        if (this.#timer) {
            cancelAnimationFrame(this.#timer);
            this.#timer = null;
        }
        this.#fromX = x;
        this.#fromY = y;
        this.#toX = x;
        this.#toY = y;
    }

    stopAt(x, y) {
        if (this.#timer) {
            cancelAnimationFrame(this.#timer);
            this.#timer = null;
        }
        this.#toX = x;
        this.#toY = y;
        this.#dispachEvent();
    }

    stop() {
        if (this.#timer) {
            cancelAnimationFrame(this.#timer);
            this.#timer = null;
        }
        this.#dispachEvent();
    }

    moveTo(x, y) {
        this.#maybeStartTimer();
        this.#toX = x;
        this.#toY = y;
    }

    #maybeStartTimer() {
        if (!this.#timer && (this.#fromX !== this.#toX || this.#fromY !== this.#toY)) {
            this.#timer = requestAnimationFrame(() => {
                this.#timer = null;
                this.#dispachEvent();
                // continous
                this.#fromX = this.#toX;
                this.#fromY = this.#toY;
            });
        }
    }

    #dispachEvent() {
        const ev = new Event("delta");
        ev.fromX = this.fromX;
        ev.fromY = this.fromY;
        ev.toX = this.toX;
        ev.toY = this.toY;
        ev.deltaX = this.deltaX;
        ev.deltaY = this.deltaY;
        this.dispatchEvent(ev);
    }

}
