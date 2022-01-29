const TIME_MS_DIFF = 3600000;

const time_stored = new WeakMap;
const time_started = new WeakMap;

export default class Timer {

    constructor() {
        time_stored.set(this, new Date(-TIME_MS_DIFF));
    }

    setTime(h = 0, m = 0, s = 0, ms = 0) {
        const t = time_stored.get(this);
        t.setHours(h);
        t.setMinutes(m);
        t.setSeconds(s);
        t.setMilliseconds(ms);
        if (time_started.has(this)) {
            time_started.set(this, new Date);
        }
    }

    getTime() {
        const t = time_stored.get(this);
        if (time_started.has(this)) {
            const time_buffer = new Date;
            t.setTime(t.getTime() + time_buffer.getTime() - time_started.get(this).getTime());
            time_started.set(this, new Date(time_buffer));
        }
        return [t.getHours(), t.getMinutes(), t.getSeconds(), t.getMilliseconds()];
    }

    setMilliseconds(value) {
        time_stored.set(this, new Date(value - TIME_MS_DIFF));
        if (time_started.has(this)) {
            time_started.set(this, new Date);
        }
    }

    getMilliseconds() {
        const t = time_stored.get(this);
        if (time_started.has(this)) {
            const time_buffer = new Date;
            t.setTime(t.getTime() + time_buffer.getTime() - time_started.get(this).getTime());
            time_started.set(this, new Date(time_buffer));
        }
        return t.getTime() + TIME_MS_DIFF;
    }

    isRunning() {
        return time_started.has(this);
    }

    start() {
        if (!time_started.has(this)) {
            time_started.set(this, new Date);
        }
    }

    stop() {
        if (time_started.has(this)) {
            const t = time_stored.get(this);
            const time_buffer = new Date;
            t.setTime(t.getTime() + time_buffer.getTime() - time_started.get(this).getTime());
            time_started.delete(this);
        }
    }

    toggle() {
        if (time_started.has(this)) {
            const t = time_stored.get(this);
            const time_buffer = new Date;
            t.setTime(t.getTime() + time_buffer.getTime() - time_started.get(this).getTime());
            time_started.delete(this);
            return false;
        } else {
            time_started.set(this, new Date);
            return true;
        }
    }

    reset() {
        time_stored.set(this, new Date(-TIME_MS_DIFF));
        if (time_started.has(this)) {
            time_started.set(this, new Date);
        }
    }

}
