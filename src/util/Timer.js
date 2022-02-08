const TIME_MS_DIFF = 3600000;

export default class Timer {

    #stored = new Date(-TIME_MS_DIFF);

    #started;

    start() {
        if (this.#started == null) {
            this.#started = new Date();
        }
    }

    stop() {
        if (this.#started != null) {
            const time_buffer = new Date();
            this.#stored.setTime(this.#stored.getTime() + time_buffer.getTime() - this.#started.getTime());
            this.#started = undefined;
        }
    }

    isRunning() {
        return this.#started != null;
    }

    save() {
        if (this.#started != null) {
            const time_buffer = new Date();
            this.#stored.setTime(this.#stored.getTime() + time_buffer.getTime() - this.#started.getTime());
            this.#started = time_buffer;
        }
    }

    reset() {
        this.#stored = new Date(-TIME_MS_DIFF);
        if (this.#started != null) {
            this.#started = new Date();
        }
    }

    setTime(h = 0, m = 0, s = 0, ms = 0) {
        this.#stored.setHours(h);
        this.#stored.setMinutes(m);
        this.#stored.setSeconds(s);
        this.#stored.setMilliseconds(ms);
        if (this.#started != null) {
            this.#started = new Date();
        }
    }

    getTime() {
        if (this.#started != null) {
            const time_buffer = new Date();
            time_buffer.setTime(this.#stored.getTime() + time_buffer.getTime() - this.#started.getTime());
            return [
                time_buffer.getHours(),
                time_buffer.getMinutes(),
                time_buffer.getSeconds(),
                time_buffer.getMilliseconds()
            ];
        } else {
            return [
                this.#stored.getHours(),
                this.#stored.getMinutes(),
                this.#stored.getSeconds(),
                this.#stored.getMilliseconds()
            ];
        }
    }

    setMilliseconds(value) {
        this.#stored = new Date(value - TIME_MS_DIFF);
        if (this.#started != null) {
            this.#started = new Date();
        }
    }

    getMilliseconds() {
        if (this.#started != null) {
            const time_buffer = new Date();
            time_buffer.setTime(this.#stored.getTime() + time_buffer.getTime() - this.#started.getTime());
            return time_buffer.getTime() + TIME_MS_DIFF;
        } else {
            return this.#stored.getTime() + TIME_MS_DIFF;
        }
    }

}
