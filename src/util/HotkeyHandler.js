import {resolveKey} from "./keyboard/KeyConverter.js";

function encodeConfig(config = {}) {
    const {
        key, ctrlKey, shiftKey, altKey, metaKey
    } = config;
    return `[${key || ""},${+ctrlKey},${+shiftKey},${+altKey},${+metaKey}]`;
}

class HotkeyHandler {

    #quickAccessCache = new Map();

    #config = new Map();

    #action = new Map();

    constructor() {
        window.addEventListener("keydown", (event) => {
            const {
                code, ctrlKey, shiftKey, altKey, metaKey
            } = event;
            const sequence = {
                ctrlKey: !!ctrlKey,
                shiftKey: !!shiftKey,
                altKey: !!altKey,
                metaKey: !!metaKey,
                key: resolveKey(code || "")
            };
            if (this.callHotkey(sequence)) {
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
            this.#deleteQuickAccess(name);
            if (typeof config == "object" && !Array.isArray(config)) {
                const newConfig = {
                    ctrlKey: !!config.ctrlKey,
                    shiftKey: !!config.shiftKey,
                    altKey: !!config.altKey,
                    metaKey: !!config.metaKey,
                    key: (config.key || "").toString()
                };
                this.#config.set(name, newConfig);
                this.#addQuickAccess(newConfig, name);
            } else {
                this.#config.remove(name);
            }
        }
    }

    getConfig(name) {
        return {...this.#config.get(name)};
    }

    callHotkey(value = {}) {
        let called = false;
        const encodedConfig = encodeConfig(value);
        const quickAccess = this.#quickAccessCache.get(encodedConfig);
        if (quickAccess != null) {
            for (const name of quickAccess) {
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

    #deleteQuickAccess(name) {
        const config = this.#config.get(name);
        if (config != null) {
            const encodedConfig = encodeConfig(config);
            const quickAccess = this.#quickAccessCache.get(encodedConfig);
            if (quickAccess != null) {
                if (quickAccess.size === 1) {
                    this.#quickAccessCache.delete(encodedConfig);
                } else {
                    quickAccess.remove(name);
                }
            }
        }
    }

    #addQuickAccess(config, name) {
        if (config != null) {
            const quickAccess = this.#getOrCreateQuickAccess(config);
            quickAccess.add(name);
        }
    }

    #getOrCreateQuickAccess(config) {
        const encodedConfig = encodeConfig(config);
        const quickAccess = this.#quickAccessCache.get(encodedConfig);
        if (quickAccess != null) {
            return quickAccess;
        }
        const newQuickAccess = new Set();
        this.#quickAccessCache.set(encodedConfig, newQuickAccess);
        return newQuickAccess;
    }

}

export default new HotkeyHandler();
