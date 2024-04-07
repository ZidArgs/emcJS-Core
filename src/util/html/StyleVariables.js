import "../../polyfills/adoptedStyleSheet.polyfill.js";

function createStyleSheet() {
    const styleEl = document.createElement("style");
    styleEl.innerHTML = ":root {}";
    document.head.appendChild(styleEl);
    return styleEl.sheet;
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
    if ("replace" in CSSStyleSheet.prototype) {
        sheet.insertRule(rule, 1);
        sheet.deleteRule(0);
    }
}

// -----------------
export default class StyleVariables {

    #stylesheet = createStyleSheet();

    #variables = new Map();

    set(name, value) {
        const current = this.#variables.get(name);
        if (current != value) {
            this.#variables.set(name, value);
            updateStyle(this.#stylesheet, this.#variables);
        }
    }

    setAll(values = {}) {
        let changed = false;
        for (const name in values) {
            const value = values[name];
            const current = this.#variables.get(name);
            if (current != value) {
                this.#variables.set(name, value);
                changed = true;
            }
        }
        if (changed) {
            updateStyle(this.#stylesheet, this.#variables);
        }
    }

    get(name) {
        return this.#variables.get(name);
    }

    apply(target) {
        if (target instanceof Document || target instanceof ShadowRoot) {
            target.adoptedStyleSheets = [...target.adoptedStyleSheets, this.#stylesheet];
        }
    }

    static set(name, value) {
        const current = STATIC_VARIABLES.get(name);
        if (current != value) {
            STATIC_VARIABLES.set(name, value);
            updateStyle(STATIC_STYLESHEET, STATIC_VARIABLES);
        }
    }

    static setAll(values = {}) {
        let changed = false;
        for (const name in values) {
            const value = values[name];
            const current = STATIC_VARIABLES.get(name);
            if (current != value) {
                STATIC_VARIABLES.set(name, value);
                changed = true;
            }
        }
        if (changed) {
            updateStyle(STATIC_STYLESHEET, STATIC_VARIABLES);
        }
    }

    static get(name) {
        return STATIC_VARIABLES.get(name) ?? STATIC_DEFAULT_VARIABLES.get(name);
    }

    static getDefault(name) {
        return STATIC_DEFAULT_VARIABLES.get(name);
    }

}
