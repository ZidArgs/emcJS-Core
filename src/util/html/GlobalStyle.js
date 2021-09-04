/* eslint-disable no-prototype-builtins */
const INDEX = new Map();
const STYLESHEETS = new WeakMap();

export default class GlobalStyle {

    constructor(rules) {
        if ("replaceSync" in CSSStyleSheet.prototype) {
            const styleSheet = new CSSStyleSheet();
            styleSheet.replaceSync(rules);
            STYLESHEETS.set(this, styleSheet);
        } else {
            const element = document.createElement("style");
            element.innerHTML = rules;
            STYLESHEETS.set(this, element);
        }
    }

    apply(target) {
        if (target instanceof Document || target instanceof ShadowRoot) {
            target.adoptedStyleSheets = [...target.adoptedStyleSheets, STYLESHEETS.get(this)];
        }
    }

    register(ref) {
        INDEX.set(ref, this);
    }

    static register(ref, style) {
        if (style instanceof GlobalStyle) {
            INDEX.set(ref, style);
        }
    }

    static getStyle(ref) {
        return INDEX.get(ref);
    }

}

/**
 * polyfills
 */

function cloneCSSStyleSheet(styleSheet) {
    const res = document.createElement("style");
    for (const rule of styleSheet.cssRules) {
        res.innerHTML += rule.cssText;
    }
    return res;
}

function cloneStyleElement(element) {
    const res = document.createElement("style");
    res.innerHTML = element.innerHTML;
    return res;
}

if (!Document.prototype.hasOwnProperty("adoptedStyleSheets")) {
    const VALUE = new WeakMap();

    Object.defineProperty(Document.prototype, "adoptedStyleSheets", {
        get: function() {
            return VALUE.get(this) || [];
        },
        set: function(newValue) {
            const oldValue = VALUE.get(this) || [];
            newValue = newValue.map(value => {
                if (value instanceof CSSStyleSheet) {
                    return cloneCSSStyleSheet(value);
                }
                if (value instanceof HTMLStyleElement) {
                    if (oldValue.indexOf(value) < 0) {
                        return cloneStyleElement(value);
                    } else {
                        return value;
                    }
                }
                try {
                    const res = document.createElement("style");
                    res.innerHTML = value;
                    return res;
                } catch(err) {
                    throw new TypeError("Failed to set the 'adoptedStyleSheets' property on 'Document': Failed to convert value to 'CSSStyleSheet'.", err);
                }
            });
            VALUE.set(this, Object.freeze(newValue));
            for (const node of oldValue) {
                if (node != null && newValue.indexOf(node) < 0) {
                    node.remove();
                }
            }
            for (const node of newValue) {
                if (node != null && node.parentElement == null) {
                    this.append(node);
                }
            }
        }
    });
}

if (!ShadowRoot.prototype.hasOwnProperty("adoptedStyleSheets")) {
    const VALUE = new WeakMap();

    Object.defineProperty(ShadowRoot.prototype, "adoptedStyleSheets", {
        get: function() {
            return VALUE.get(this) || [];
        },
        set: function(newValue) {
            const oldValue = VALUE.get(this) || [];
            newValue = newValue.map(value => {
                if (value instanceof CSSStyleSheet) {
                    return cloneCSSStyleSheet(value);
                }
                if (value instanceof HTMLStyleElement) {
                    if (oldValue.indexOf(value) < 0) {
                        return cloneStyleElement(value);
                    } else {
                        return value;
                    }
                }
                try {
                    const res = document.createElement("style");
                    res.innerHTML = value;
                    return res.sheet;
                } catch(err) {
                    throw new TypeError("Failed to set the 'adoptedStyleSheets' property on 'ShadowRoot': Failed to convert value to 'CSSStyleSheet'.", err);
                }
            });
            VALUE.set(this, Object.freeze(newValue));
            for (const node of oldValue) {
                if (node != null && newValue.indexOf(node) < 0) {
                    node.remove();
                }
            }
            for (const node of newValue) {
                if (node != null && node.parentElement == null) {
                    this.append(node);
                }
            }
        }
    });
}
