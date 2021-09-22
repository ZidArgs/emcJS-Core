const styleEl = document.createElement("style");
styleEl.innerHTML = ":root {}"
document.head.appendChild(styleEl);
const styleSheet = styleEl.sheet;

const DEFAULT_VARIABLES = new Map();
const VARIABLES = new Map();

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
                                DEFAULT_VARIABLES.set(name.slice(2), style.getPropertyValue(name).trim());
                            }
                        }
                    }
                }
            }
        } catch(err) {
            console.warn(`extracting global variables failed for style "${sheet.href}" - ${err}`);
        }
    }
}
for (const sheet of Array.from(document.styleSheets)) {
    extractAllRules(sheet);
}

// add dynamic variable handler

function updateStyle() {
    const vars = [];
    for (const [key, value] of VARIABLES) {
        if (value != null) {
            vars.push(`--${key}: ${value}`);
        }
    }
    const rule = `:root{${vars.join(";")}}`;
    if ("replace" in CSSStyleSheet.prototype) {
        styleSheet.insertRule(rule, 1);
        styleSheet.deleteRule(0);
    }
}

class StyleVariables {

    set(name, value) {
        const current = VARIABLES.get(name);
        if (current != value) {
            VARIABLES.set(name, value);
            updateStyle();
        }
    }

    steAll(values = {}) {
        let changed = false;
        for (const name in values) {
            const value = values[name];
            const current = VARIABLES.get(name);
            if (current != value) {
                VARIABLES.set(name, value);
                changed = true;
            }
        }
        if (changed) {
            updateStyle();
        }
    }

    get(name) {
        return VARIABLES.get(name) ?? DEFAULT_VARIABLES.get(name);
    }

    getDefault(name) {
        return DEFAULT_VARIABLES.get(name);
    }

}

const styleVariables = new StyleVariables();
window.styleVariables = styleVariables;
export default styleVariables;
