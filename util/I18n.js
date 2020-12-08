import Logger from "./Logger.js";

const languages = new Map();
let actLang = "";

function hasTranslation(key) {
    if (!key || typeof key != "string") return false;
    if (languages.get(actLang).has(key)) {
        return true;
    }
    Logger.warn(`translation for "${key}" missing`, "I18n");
    return false;
}

function getTranslation(key) {
    if (!key || typeof key != "string") return "";
    if (languages.get(actLang).has(key)) {
        return languages.get(actLang).get(key).trim();
    }
    Logger.warn(`translation for "${key}" missing`, "I18n");
    return key;
}

class I18n extends EventTarget {

    setLanguage(lang) {
        if (actLang != lang && languages.has(lang)) {
            actLang = lang;
            const event = new Event("language");
            event.language = lang;
            this.dispatchEvent(event);
        }
    }
    
    setTranslation(lang, values = {}) {
        if (typeof lang != "string") return;
        if (!languages.has(lang)) {
            languages.set(lang, new Map());
        }
        if (!actLang) {
            actLang = lang;
        }
        const changes = {};
        for (const key in values) {
            if (typeof key != "string") continue;
            const value = values[key];
            if (typeof value != "string") continue;
            languages.get(lang).set(key, value);
            changes[key] = value;
        }
        if (lang == actLang) {
            const event = new Event("translation");
            event.changes = changes;
            this.dispatchEvent(event);
        }
    }

    /**
     * @deprecated
     */
    translate(key) {
        if (!!actLang) {
            return getTranslation(key);
        }
        Logger.warn(`no translation loaded`, "I18n");
        return key;
    }

    get(key) {
        if (!!actLang) {
            return getTranslation(key);
        }
        Logger.warn(`no translation loaded`, "I18n");
        return key;
    }

    has(key) {
        if (!!actLang) {
            return hasTranslation(key);
        }
        Logger.warn(`no translation loaded`, "I18n");
        return false;
    }

}

export default new I18n();
