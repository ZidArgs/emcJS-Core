class HotkeyHandler {

    #config = new Map();

    #action = new Map();

    constructor() {
        window.addEventListener("keydown", (event) => {
            const {
                key, ctrlKey, shiftKey, altKey, metaKey
            } = event;
            if (this.callHotkey(key, ctrlKey, shiftKey, altKey, metaKey)) {
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
                    shiftKey: !!config.shiftKey,
                    altKey: !!config.altKey,
                    metaKey: !!config.metaKey,
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
                    shiftKey: !!config.shiftKey,
                    altKey: !!config.altKey,
                    metaKey: !!config.metaKey,
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

    callHotkey(key, ctrlKey = false, shiftKey = false, altKey = false, metaKey = false) {
        let called = false;
        for (const [name, value] of this.#config) {
            const {
                key: hKey,
                ctrlKey: hCtrlKey,
                shiftKey: hShiftKey,
                altKey: hAltKey,
                metaKey: hMetaKey
            } = value;

            if (
                key.toLowerCase() === hKey?.toLowerCase() &&
                ctrlKey === hCtrlKey &&
                shiftKey === hShiftKey &&
                altKey === hAltKey &&
                metaKey === hMetaKey
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
