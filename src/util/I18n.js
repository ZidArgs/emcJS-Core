import FileLoader from "./file/FileLoader.js";
import {numberedStringComparator} from "./helper/Comparator.js";
import {flattenObject} from "./helper/collection/ObjectContent.js";
import Import from "./import/Import.js";
import Logger from "./log/Logger.js";

const INTERNAL_VALUES_REGEX = /\{\{([0-9]+)::(.*?)\}\}/g;
const TEMPLATE_VALUES_REGEX = /\{\{([0-9]+)\}\}/g;

function extractInternalValues(key) {
    const res = {};
    let match;
    do {
        match = INTERNAL_VALUES_REGEX.exec(key);
        if (match) {
            res[match[1]] =  match[2];
        }
    } while (match);
    return res;
}

async function importBasefile(basePath, type, name) {
    switch (type) {
        case "lang": {
            const trans = await FileLoader.lang(`${basePath}/${name}.lang`);
            return trans;
        }
        case "properties": {
            const trans = await FileLoader.properties(`${basePath}/${name}.properties`);
            return trans;
        }
        case "json": {
            const trans = await FileLoader.jsonc(`${basePath}/${name}.json`);
            return flattenObject(trans);
        }
        case "js": {
            const [exec] = await Import.module(`${basePath}/${name}.js`);
            const trans = exec();
            return flattenObject(trans);
        }
        default: {
            return {};
        }
    }
}

async function importFragment(basePath, type, name) {
    switch (type) {
        case "lang": {
            const trans = await FileLoader.lang(`${basePath}/fragments/${name}.lang`);
            return trans;
        }
        case "properties": {
            const trans = await FileLoader.properties(`${basePath}/fragments/${name}.properties`);
            return trans;
        }
        case "json": {
            const trans = await FileLoader.jsonc(`${basePath}/fragments/${name}.json`);
            return flattenObject(trans);
        }
        case "js": {
            const [exec] = await Import.module(`${basePath}/fragments/${name}.js`);
            const trans = exec();
            return flattenObject(trans);
        }
        default: {
            return {};
        }
    }
}

class I18n extends EventTarget {

    static logger = new Logger(I18n);

    #languages = new Map();

    #base = new Map();

    #missing = new Map();

    #default = "";

    #active = "";

    getMeta(key, lang = this.language) {
        key = `@${key}`;
        if (this.#languages.get(lang)?.has(key)) {
            return this.#languages.get(lang).get(key);
        }
    }

    async loadTranslations(basePath = "/i18n") {
        try {
            const languages = await FileLoader.json(`${basePath}/_meta.json`);
            const langLabels = {};
            for (const key in languages) {
                const data = languages[key];
                langLabels[key] = data["label"];
            }
            const loading = [];
            for (const key in languages) {
                const data = languages[key];
                loading.push(this.#loadTranslation(basePath, key, data, langLabels));
            }
            await Promise.all(loading);
        } catch (err) {
            I18n.logger.error(new Error(`could not load language names`, {cause: err}));
        }
    }

    async #loadTranslation(basePath, key, data, langLabels) {
        try {
            this.setBase(key, data["base"]);
            // fetch all translation files
            const transProm = [];
            for (const {
                type, name
            } of data["fragments"] ?? []) {
                transProm.push(importFragment(basePath, type, name));
            }
            transProm.push(importBasefile(basePath, data["type"] ?? "lang", key));
            // build resulting translation
            let translation = {};
            const translations = await Promise.all(transProm);
            for (const trans of translations) {
                translation = Object.assign(translation, trans);
            }
            translation = Object.assign(translation, langLabels);
            this.setTranslation(key, translation);
        } catch (err) {
            I18n.logger.error(new Error(`could not load lang ${key}`, {cause: err}));
        }
    }

    setBase(lang, base = "") {
        if (typeof lang !== "string" || !lang) {
            return;
        }
        const oldBase = this.#base.get(lang) ?? "";
        if (oldBase != base) {
            if (base) {
                this.#base.set(lang, base);
            } else {
                this.#base.delete(lang);
            }
            if (lang == this.#active) {
                const changes = {};
                const trans = this.#languages.get(lang);
                const oldTrans = this.#languages.get(oldBase);
                const newTrans = this.#languages.get(base);
                const baseKeys = new Set(oldTrans.keys().concat(newTrans.keys()));
                for (const key of baseKeys) {
                    if (!trans.has(key)) {
                        if (oldTrans.get(key) != newTrans.get(key)) {
                            changes[key] = newTrans.get(key);
                        }
                    }
                }
                const event = new Event("translation");
                event.changes = changes;
                this.dispatchEvent(event);
            }
        }
    }

    setTranslation(lang, values = {}) {
        if (typeof lang !== "string" || !lang) {
            return;
        }
        let isNew = false;
        if (!this.#languages.has(lang)) {
            this.#languages.set(lang, new Map());
            isNew = true;
        }
        if (!this.#missing.has(lang)) {
            this.#missing.set(lang, new Set());
        }
        if (!this.#active) {
            this.#active = lang;
        }
        const changes = {};
        for (const key in values) {
            if (!key || typeof key !== "string" || key.startsWith("@")) {
                continue;
            }
            const value = values[key];
            if (!value || typeof value !== "string") {
                continue;
            }
            const trans = this.#languages.get(lang);
            if (trans.get(key) != value) {
                changes[key] = value;
            }
            trans.set(key, value);
        }
        if (lang == this.#active && Object.keys(changes).length) {
            const event = new Event("translation");
            event.changes = changes;
            this.dispatchEvent(event);
        }
        if (isNew) {
            this.dispatchEvent(new Event("languages"));
        }
    }

    set default(lang) {
        if (typeof lang !== "string") {
            return;
        }
        if (this.#default != lang) {
            const oldLang = this.language;
            this.#default = lang;
            const newLang = this.language;
            if (oldLang != newLang) {
                const event = new Event("language");
                event.language = newLang;
                this.dispatchEvent(event);
            }
        }
    }

    set language(lang) {
        if (typeof lang !== "string") {
            return;
        }
        if (this.#active != lang) {
            const oldLang = this.language;
            this.#active = lang;
            const newLang = this.language;
            if (oldLang != newLang) {
                const event = new Event("language");
                event.language = newLang;
                this.dispatchEvent(event);
            }
        }
    }

    get language() {
        const act = this.#active;
        if (typeof act === "string" && act && this.#languages.has(act)) {
            return act;
        }
        const def = this.#default;
        if (typeof def === "string" && def) {
            return def;
        }
        return "";
    }

    get(key, ...substitutions) {
        if (key == null || (typeof key === "string" && key.startsWith("@"))) {
            return "";
        }
        const internalValues = extractInternalValues(key);
        const trans = this.#getTranslation(this.language, key.replace(INTERNAL_VALUES_REGEX, "{{$1}}")).trim();
        return trans.replace(TEMPLATE_VALUES_REGEX, (_, n) => {
            const value = substitutions[n] ?? internalValues[n];
            const trans = this.#getTranslation(this.language, value).trim();
            return trans;
        });
    }

    #getTranslation(lang, key) {
        if (key == null) {
            return "";
        }
        if (typeof key === "number" || !isNaN(parseFloat(key))) {
            return key;
        }
        if (typeof key === "string" && key !== "" && !key.startsWith("@")) {
            if (typeof lang === "string" && lang) {
                if (!this.#languages.has(lang)) {
                    I18n.logger.warn(`language "${lang}" is not loaded`);
                    return key;
                }
                if (this.#languages.get(lang).has(key)) {
                    return this.#languages.get(lang).get(key);
                }
                let base = lang;
                while (this.#base.has(base)) {
                    const oldBase = base;
                    base = this.#base.get(base);
                    if (!this.#languages.has(base)) {
                        I18n.logger.warn(`language "${base}" requested as base from "${oldBase}" is not loaded`);
                        return key;
                    }
                    if (this.#languages.get(base)?.has(key)) {
                        return this.#languages.get(base).get(key);
                    }
                }
                if (!this.#missing.get(lang).has(key)) {
                    this.#missing.get(lang).add(key);
                    I18n.logger.warn(`translation for "${key}" in "${lang}" missing`);
                }
            }
            return key;
        }
        return "";
    }

    has(key) {
        return this.#hasTranslation(this.language, key);
    }

    #hasTranslation(lang, key) {
        if (typeof key !== "string" || !key || key.startsWith("@")) {
            return false;
        }
        if (typeof lang === "string" && lang) {
            if (this.#languages.get(lang)?.has(key)) {
                return true;
            }
            if (this.#base.has(lang)) {
                const base = this.#base.has(lang);
                if (this.#languages.get(base)?.has(key)) {
                    return true;
                }
            }
        }
        return false;
    }

    // extras

    getLanguages() {
        return Array.from(this.#languages.keys());
    }

    getKeys(lang) {
        const keys = new Set();
        if (typeof lang === "string" && lang) {
            const language = this.#languages.get(lang) ?? [];
            for (const [key] of language) {
                if (!key.startsWith("@")) {
                    keys.add(key);
                }
            }
            const missing = this.#missing.get(lang) ?? [];
            for (const key of missing) {
                keys.add(key);
            }
        } else {
            for (const [, language] of this.#languages) {
                for (const [key] of language) {
                    if (!key.startsWith("@")) {
                        keys.add(key);
                    }
                }
            }
            for (const [, missing] of this.#missing) {
                for (const key of missing) {
                    keys.add(key);
                }
            }
        }
        return Array.from(keys);
    }

    getMissing(lang) {
        const keys = new Set();
        if (typeof lang === "string" && lang) {
            const missing = this.#missing.get(lang) ?? [];
            for (const key of missing) {
                keys.add(key);
            }
        } else {
            for (const [, missing] of this.#missing) {
                for (const key of missing) {
                    keys.add(key);
                }
            }
        }
        return Array.from(keys);
    }

    getEntries(lang) {
        const entries = {};
        if (typeof lang === "string" && lang) {
            const language = this.#languages.get(lang) ?? [];
            for (const [key, value] of language) {
                if (!key.startsWith("@")) {
                    entries[key] = value;
                }
            }
            const missing = this.#missing.get(lang) ?? [];
            for (const key of missing) {
                entries[key] = "";
            }
            return entries;
        }
    }

    compareValuesTranslated(value0, value1) {
        const translated0 = this.get(value0);
        const translated1 = this.get(value1);
        return translated0.localeCompare(translated1);
    }

    compareNumberedValuesTranslated(value0, value1) {
        const translated0 = this.get(value0);
        const translated1 = this.get(value1);
        return numberedStringComparator(translated0, translated1);
    }

}

const i18n = new I18n();
window.i18n = i18n;

export default i18n;
