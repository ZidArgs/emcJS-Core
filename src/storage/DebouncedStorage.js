
import Helper from "../util/helper/Helper.js";

const CATEGORY = new WeakMap();
const STATE = new WeakMap();
const CHANGES = new WeakMap();
const DEBOUNCE_TIMER = new WeakMap();

let DEBOUNCE_TIME = 500;

function debounceFunction() {
    DEBOUNCE_TIMER.delete(this);
    const state = STATE.get(this);
    const changes = CHANGES.get(this);
    const changed = {};
    for (const [key, value] of changes) {
        changed[key] = {
            oldValue: state.get(key),
            newValue: value
        };
        state.set(key, value);
    }
    changes.clear();
    const event = new Event("change");
    event.category = CATEGORY.get(this);
    event.data = changed;
    this.dispatchEvent(event);
}

export default class DebouncedStorage extends EventTarget {

    static get debounceTime() {
        return DEBOUNCE_TIME;
    }

    static set debounceTime(value) {
        value = parseInt(value);
        if (isNaN(value)) throw new TypeError("value must be a number");
        if (value < 0 || value > 60000) throw new RangeError("value must be between 0 and 60000");
        DEBOUNCE_TIME = value;
    }

    constructor(category) {
        super();
        CATEGORY.set(this, category);
        CHANGES.set(this, new Map());
        STATE.set(this, new Map());
    }

    overwrite(data) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
        state.clear();
        changes.clear();
        for (const key in data) {
            const value = data[key];
            state.set(key, value);
        }
    }

    clear() {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
        for (const [key, value] of state) {
            if (value != null) {
                changes[key] = undefined;
            }
        }
        for (const [key, value] of changes) {
            if (value != null) {
                changes[key] = undefined;
            }
        }
        if (changes.size) {
            DEBOUNCE_TIMER.set(this, setTimeout(debounceFunction.bind(this), DEBOUNCE_TIME));
        }
        state.clear();
    }

    set(key, value) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (!state.has(key) || !Helper.isEqual(state.get(key), value)) {
            changes.set(key, value);
            // clear timeout
            if (DEBOUNCE_TIMER.has(this)) {
                clearTimeout(DEBOUNCE_TIMER.get(this));
                DEBOUNCE_TIMER.delete(this);
            }
            // set timeout
            DEBOUNCE_TIMER.set(this, setTimeout(debounceFunction.bind(this), DEBOUNCE_TIME));
        } else if (changes.has(key)) {
            changes.delete(key);
            // clear timeout
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
            // set timeout
            if (changes.size) {
                DEBOUNCE_TIMER.set(this, setTimeout(debounceFunction.bind(this), DEBOUNCE_TIME));
            }
        }
    }

    setAll(data) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        let changed = false;
        for (const key in data) {
            const value = data[key];
            if (!state.has(key) || !Helper.isEqual(state.get(key), value)) {
                changes.set(key, value);
                changed = true;
            } else if (changes.has(key)) {
                changes.delete(key);
                changed = true;
            }
        }
        if (changed && DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
        if (changes.size) {
            DEBOUNCE_TIMER.set(this, setTimeout(debounceFunction.bind(this), DEBOUNCE_TIME));
        }
    }

    get(key) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (changes.has(key)) {
            return changes.get(key);
        } else {
            return state.get(key);
        }
    }

    getAll() {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        const data = {};
        for (const [key, value] of state) {
            data[key] = value;
        }
        for (const [key, value] of changes) {
            data[key] = value;
        }
        return data;
    }

    has(key) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (changes.has(key) || state.has(key)) {
            return true;
        } else {
            return false;
        }
    }

    clearImmediate() {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        const changed = {};
        for (const [key, value] of state) {
            if (value != null) {
                changed[key] = {
                    oldValue: state.get(key),
                    newValue: value
                };
            }
        }
        state.clear();
        changes.clear();
        if (DEBOUNCE_TIMER.has(this)) {
            clearTimeout(DEBOUNCE_TIMER.get(this));
            DEBOUNCE_TIMER.delete(this);
        }
        if (Object.keys(changed).length) {
            const event = new Event("change");
            event.category = CATEGORY.get(this);
            event.data = changed;
            this.dispatchEvent(event);
        }
    }

    setImmediate(key, current, change) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (DEBOUNCE_TIMER.has(this)) {
            state.set(key, current);
            if (!Helper.isEqual(current, change)) {
                changes.set(key, change);
            } else if (changes.has(key)) {
                changes.delete(key);
                if (!changes.size) {
                    clearTimeout(DEBOUNCE_TIMER.get(this));
                    DEBOUNCE_TIMER.delete(this);
                }
            }
        } else {
            if (!state.has(key) || !Helper.isEqual(state.get(key), change)) {
                const changed = {};
                changed[key] = {
                    oldValue: state.get(key),
                    newValue: change
                };
                state.set(key, change);
                const event = new Event("change");
                event.category = CATEGORY.get(this);
                event.data = changed;
                this.dispatchEvent(event);
            }
        }
    }

    getImmediate(key) {
        const state = STATE.get(this);
        return state.get(key);
    }

    setImmediateAll(data) {
        const state = STATE.get(this);
        const changes = CHANGES.get(this);
        if (DEBOUNCE_TIMER.has(this)) {
            for (const key in data) {
                const {current, change} = data[key];
                state.set(key, current);
                if (!Helper.isEqual(current, change)) {
                    changes.set(key, change);
                } else if (changes.has(key)) {
                    changes.delete(key);
                }
            }
            if (!changes.size) {
                clearTimeout(DEBOUNCE_TIMER.get(this));
                DEBOUNCE_TIMER.delete(this);
            }
        } else {
            const changed = {};
            for (const key in data) {
                const {change} = data[key];
                if (!state.has(key) || !Helper.isEqual(state.get(key), change)) {
                    changed[key] = {
                        oldValue: state.get(key),
                        newValue: change
                    };
                    state.set(key, change);
                }
            }
            if (Object.keys(changed).length) {
                const event = new Event("change");
                event.category = CATEGORY.get(this);
                event.data = changed;
                this.dispatchEvent(event);
            }
        }
    }

}
