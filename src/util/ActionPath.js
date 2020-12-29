const ACTION_LIST = new WeakMap();
const POINTER = new WeakMap();

export default class ActionPath {

    constructor() {
        this.clear();
    }

    put(step) {
        let pointer = POINTER.get(this);
        const actions = ACTION_LIST.get(this);
        actions[pointer++] = step;
        if (pointer < actions.length) {
            const newActions = actions.slice(0, pointer);
            ACTION_LIST.set(this, newActions);
        }
        POINTER.set(this, pointer);
    }

    clear() {
        ACTION_LIST.set(this, []);
        POINTER.set(this, 0);
    }

    redo() {
        let pointer = POINTER.get(this);
        const actions = ACTION_LIST.get(this);
        if (actions.length > 0 && pointer < actions.length) {
            const res = actions[pointer++];
            POINTER.set(this, pointer);
            return res;
        }
    }

    undo() {
        let pointer = POINTER.get(this);
        const actions = ACTION_LIST.get(this);
        if (actions.length > 0 && pointer > 0) {
            const res = actions[--pointer];
            POINTER.set(this, pointer);
            return res;
        }
    }

}
