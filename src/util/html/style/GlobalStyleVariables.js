import {debounce} from "../../Debouncer.js";
import "../../../polyfills/adoptedStyleSheet.polyfill.js";

function createStyleSheet() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(":root {}");
    return sheet;
}

const STATIC_STYLESHEET = createStyleSheet();
const STATIC_DEFAULT_VARIABLES = new Map();
const STATIC_VARIABLES = new Map();

// extract default variables

function extractAllRules(sheet) {
    if (sheet.href === null || sheet.href.startsWith(window.location.origin)) {
        try {
            const rules = sheet.cssRules;
            for (const rule of Array.from(rules)) {
                if (rule instanceof CSSImportRule) {
                    extractAllRules(rule.styleSheet);
                } else if (rule instanceof CSSStyleRule) {
                    if (rule.selectorText === ":root") {
                        const style = rule.style;
                        for (const name of Array.from(style)) {
                            if (name.startsWith("--")) {
                                STATIC_DEFAULT_VARIABLES.set(name.slice(2), style.getPropertyValue(name).trim());
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.warn(`extracting global variables failed for style "${sheet.href}" - ${err}`);
        }
    }
}

for (const sheet of Array.from(document.styleSheets)) {
    extractAllRules(sheet);
}

// add dynamic variable handler

function updateStyle(sheet, variables) {
    const vars = [];
    for (const [key, value] of variables) {
        if (value != null) {
            vars.push(`--${key}: ${value}`);
        }
    }
    const rule = `:root{${vars.join(";")}}`;
    sheet.replace(rule);
}

// -----------------
export default class StyleVariables {

    #stylesheet = createStyleSheet();

    #variables = new Map();

    constructor(target) {
        if (!(target instanceof Document || target instanceof ShadowRoot)) {
            throw new TypeError("target must be a Document or ShadowRoot");
        }
        target.adoptedStyleSheets = [...target.adoptedStyleSheets, this.#stylesheet];
    }

    set(name, value) {
        const current = this.get(name);
        if (current != value) {
            this.#variables.set(name, value);
            this.#update();
        }
    }

    setAll(values = {}) {
        for (const name in values) {
            const value = values[name];
            this.set(name, value);
        }
    }

    get(name) {
        return this.#variables.get(name);
    }

    reset() {
        this.#variables.clear();
        this.#update();
    }

    #update = debounce(() => {
        updateStyle(this.#stylesheet, this.#variables);
    });

    static set(name, value) {
        const current = this.get(name);
        if (current != value) {
            STATIC_VARIABLES.set(name, value);
            this.#updateStatic();
        }
    }

    static setAll(values = {}) {
        for (const name in values) {
            const value = values[name];
            this.set(name, value);
        }
    }

    static get(name) {
        return STATIC_VARIABLES.get(name) ?? this.getDefault(name);
    }

    static getDefault(name) {
        return STATIC_DEFAULT_VARIABLES.get(name);
    }

    static reset() {
        STATIC_VARIABLES.clear();
        this.#updateStatic();
    }

    static #updateStatic = debounce(() => {
        updateStyle(STATIC_STYLESHEET, STATIC_VARIABLES);
    });

}
