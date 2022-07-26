class HotkeyHandler {

    #config = new Map();

    #action = new Map();

    constructor() {
        window.addEventListener("keydown", (event) => {
            if (this.callHotkey(event.key, event.ctrlKey, event.altKey, event.shiftKey)) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
    }

    setAction(name, fn, config) {
        if (typeof name == "string" && typeof fn == "function") {
            this.#action.set(name, fn);
            if (typeof config == "object" && !Array.isArray(config)) {
                this.#config.set(name, {
                    ctrlKey: !!config.ctrlKey,
                    altKey: !!config.altKey,
                    shiftKey: !!config.shiftKey,
                    key: (config.key || "").toString()
                });
            }
        }
    }

    getActionNames() {
        return Array.from(this.#action.keys());
    }

    setConfig(name, config) {
        if (this.#action.has(name)) {
            if (typeof config == "object" && !Array.isArray(config)) {
                this.#config.set(name, {
                    ctrlKey: !!config.ctrlKey,
                    altKey: !!config.altKey,
                    shiftKey: !!config.shiftKey,
                    key: (config.key || "").toString()
                });
            } else {
                this.#config.remove(name);
            }
        }
    }

    getConfig(name) {
        return Object.assign({}, this.#config.get(name));
    }

    callHotkey(key, ctrlKey = false, altKey = false, shiftKey = false) {
        let called = false;
        for (const [name, value] of this.#config) {
            const {
                key: hKey,
                ctrlKey: hCtrlKey,
                altKey: hAltKey,
                shiftKey: hShiftKey
            } = value;

            if (
                key.toLowerCase() === hKey?.toLowerCase() &&
                ctrlKey === hCtrlKey &&
                altKey === hAltKey &&
                shiftKey === hShiftKey
            ) {
                this.#action.get(name)();
                called = true;
            }
        }
        return called;
    }

    clear() {
        this.#action.clear();
        this.#config.clear();
    }

}

export default new HotkeyHandler();
