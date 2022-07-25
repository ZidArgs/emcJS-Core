
const CONFIG = new Map();
const ACTION = new Map();

class HotkeyHandler {

    setAction(name, fn, config) {
        if (typeof name == "string" && typeof fn == "function") {
            ACTION.set(name, fn);
            if (typeof config == "object" && !Array.isArray(config)) {
                CONFIG.set(name, {
                    ctrlKey: !!config.ctrlKey,
                    altKey: !!config.altKey,
                    shiftKey: !!config.shiftKey,
                    key: (config.key || "").toString()
                });
            }
        }
    }

    getActionNames() {
        return Array.from(ACTION.keys());
    }

    setConfig(name, config) {
        if (ACTION.has(name)) {
            if (typeof config == "object" && !Array.isArray(config)) {
                CONFIG.set(name, {
                    ctrlKey: !!config.ctrlKey,
                    altKey: !!config.altKey,
                    shiftKey: !!config.shiftKey,
                    key: (config.key || "").toString()
                });
            } else {
                CONFIG.remove(name);
            }
        }
    }

    getConfig(name) {
        return Object.assign({}, CONFIG.get(name));
    }

    callHotkey(key, ctrlKey = false, altKey = false, shiftKey = false) {
        let called = false;
        for (const [name, value] of CONFIG) {
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
                ACTION.get(name)();
                called = true;
            }
        }
        return called;
    }

    clear() {
        ACTION.clear();
        CONFIG.clear();
    }

}

export default new HotkeyHandler();
