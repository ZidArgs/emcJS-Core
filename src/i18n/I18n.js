import Logger from "../util/Logger.js";

const LANGUAGES = new Map();
const MISSING = new Map();
let actLang = "";

class I18n extends EventTarget {

    setDefaultLanguage(lang) {
        if (actLang != lang && LANGUAGES.has(lang)) {
            actLang = lang;
            const event = new Event("language");
            event.language = lang;
            this.dispatchEvent(event);
        }
    }

    setLanguage(lang) {
        if (actLang != lang && LANGUAGES.has(lang)) {
            actLang = lang;
            const event = new Event("language");
            event.language = lang;
            this.dispatchEvent(event);
        }
    }
    
    setTranslation(lang, values = {}) {
        if (typeof lang != "string") {
            return;
        }
        if (!LANGUAGES.has(lang)) {
            LANGUAGES.set(lang, new Map());
        }
        if (!MISSING.has(lang)) {
            MISSING.set(lang, new Set());
        }
        if (!actLang) {
            actLang = lang;
        }
        const changes = {};
        for (const key in values) {
            if (!key || typeof key != "string") {
                continue;
            }
            const value = values[key];
            if (!value || typeof value != "string") {
                continue;
            }
            LANGUAGES.get(lang).set(key, value);
            changes[key] = value;
        }
        if (lang == actLang && Object.keys(changes).length) {
            const event = new Event("translation");
            event.changes = changes;
            this.dispatchEvent(event);
        }
    }

    getKeys(lang) {
        const keys = new Set();
        if (lang != null) {
            const language = LANGUAGES.get(lang);
            for (const [key] of language) {
                keys.add(key);
            }
            const missing = MISSING.get(lang);
            for (const key of missing) {
                keys.add(key);
            }
        } else {
            for (const [, language] of LANGUAGES) {
                for (const [key] of language) {
                    keys.add(key);
                }
            }
            for (const [, missing] of MISSING) {
                for (const key of missing) {
                    keys.add(key);
                }
            }
        }
        return Array.from(keys);
    }

    getMissing(lang) {
        const keys = new Set();
        if (lang != null) {
            const missing = MISSING.get(lang);
            for (const key of missing) {
                keys.add(key);
            }
        } else {
            for (const [, missing] of MISSING) {
                for (const key of missing) {
                    keys.add(key);
                }
            }
        }
        return Array.from(keys);
    }

    /**
     * @deprecated
     */
    translate(key) {
        return this.get(key);
    }

    get(key) {
        if (key == null) {
            return "";
        }
        if (typeof key == "number" || !isNaN(parseFloat(key))) {
            return key;
        }
        if (typeof key == "string") {
            if (actLang) {
                if (key == "") {
                    return "";
                }
                if (LANGUAGES.get(actLang).has(key)) {
                    return LANGUAGES.get(actLang).get(key).trim();
                }
                if (!MISSING.get(actLang).has(key)) {
                    MISSING.get(actLang).add(key);
                    Logger.warn(`translation for "${key}" missing`, "I18n");
                    console.warn(`translation for "${key}" missing`);
                }
                return key;
            }
            return key;
        }
        return "";
    }

    has(key) {
        if (typeof key != "string" || !key) {
            return false;
        }
        if (actLang) {
            if (LANGUAGES.get(actLang).has(key)) {
                return true;
            }
            return false;
        }
        return false;
    }

}

const i18n = new I18n();
window.i18n = i18n;
export default i18n;
