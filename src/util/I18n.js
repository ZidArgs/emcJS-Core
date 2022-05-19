import FileLoader from "./FileLoader.js";
import ObjectHelper from "./helper/ObjectHelper.js";
import Import from "./import/Import.js";
import Logger from "./Logger.js";

async function importFragment(basePath, type, name) {
    switch (type) {
        case "lang": {
            const trans = await FileLoader.properties(`${basePath}/fragments/${name}.lang`);
            return trans;
        }
        case "properties": {
            const trans = await FileLoader.properties(`${basePath}/fragments/${name}.properties`);
            return trans;
        }
        case "json": {
            const trans = await FileLoader.jsonc(`${basePath}/fragments/${name}.json`);
            return ObjectHelper.flatten(trans);
        }
        case "js": {
            const [exec] = await Import.module(`${basePath}/fragments/${name}.js`);
            const trans = exec();
            return ObjectHelper.flatten(trans);
        }
        default: {
            return {};
        }
    }
}

class I18n extends EventTarget {

    #languages = new Map();

    #base = new Map();

    #missing = new Map();

    #default = "";

    #active = "";

    async loadTranslations(basePath = "/i18n") {
        try {
            const languages = await FileLoader.json(`${basePath}/_meta.json`);
            const langLabels = {};
            for (const key in languages) {
                const data = languages[key];
                langLabels[key] = data["label"];
            }
            for (const key in languages) {
                const data = languages[key];
                try {
                    const translationFile = await FileLoader.properties(`${basePath}/${key}.lang`);
                    let translation = {};
                    for (const {type, name} of data["fragments"]) {
                        const importTranslation = await importFragment(basePath, type, name);
                        translation = Object.assign(translation, importTranslation);
                    }
                    translation = Object.assign(translation, translationFile);
                    translation = Object.assign(translation, langLabels);
                    this.setBase(key, data["base"]);
                    this.setTranslation(key, translation);
                } catch (err) {
                    console.error(err);
                    Logger.error(new Error(`could not load lang ${key}`), "I18n");
                }
            }
        } catch (err) {
            console.error(err);
            Logger.error(new Error(`could not load language names`), "I18n");
        }
    }

    setBase(lang, base = "") {
        if (typeof lang != "string" || !lang) {
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
        if (typeof lang != "string" || !lang) {
            return;
        }
        if (!this.#languages.has(lang)) {
            this.#languages.set(lang, new Map());
        }
        if (!this.#missing.has(lang)) {
            this.#missing.set(lang, new Set());
        }
        if (!this.#active) {
            this.#active = lang;
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
    }

    set default(lang) {
        if (typeof lang != "string") {
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
        if (typeof lang != "string") {
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
        if (typeof act == "string" && act) {
            return act;
        }
        const def = this.#default;
        if (typeof def == "string" && def) {
            return def;
        }
        return "";
    }

    /**
     * @deprecated
     */
    translate(key) {
        return this.get(key);
    }

    get(key) {
        return this.#getTranslation(this.language, key);
    }

    #getTranslation(lang, key) {
        if (key == null) {
            return "";
        }
        if (typeof key == "number" || !isNaN(parseFloat(key))) {
            return key;
        }
        if (typeof key == "string") {
            if (typeof lang == "string" && lang) {
                if (key == "") {
                    return "";
                }
                if (this.#languages.get(lang).has(key)) {
                    return this.#languages.get(lang).get(key).trim();
                }
                if (this.#base.has(lang)) {
                    const base = this.#base.has(lang)
                    if (this.#languages.get(base).has(key)) {
                        return this.#languages.get(base).get(key).trim();
                    }
                }
                if (!this.#missing.get(lang).has(key)) {
                    this.#missing.get(lang).add(key);
                    Logger.warn(`translation for "${key}" in "${lang}" missing`, "I18n");
                    console.warn(`translation for "${key}" in "${lang}" missing`);
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
        if (typeof key != "string" || !key) {
            return false;
        }
        if (typeof lang == "string" && lang) {
            if (this.#languages.get(lang).has(key)) {
                return true;
            }
            if (this.#base.has(lang)) {
                const base = this.#base.has(lang)
                if (this.#languages.get(base).has(key)) {
                    return true;
                }
            }
        }
        return false;
    }

    // extras

    getLanguages() {
        return this.#languages.keys();
    }

    getKeys(lang) {
        const keys = new Set();
        if (typeof lang == "string" && lang) {
            const language = this.#languages.get(lang);
            for (const [key] of language) {
                keys.add(key);
            }
            const missing = this.#missing.get(lang);
            for (const key of missing) {
                keys.add(key);
            }
        } else {
            for (const [, language] of this.#languages) {
                for (const [key] of language) {
                    keys.add(key);
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
        if (typeof lang == "string" && lang) {
            const missing = this.#missing.get(lang);
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

}

const i18n = new I18n();
window.i18n = i18n;

export default i18n;
