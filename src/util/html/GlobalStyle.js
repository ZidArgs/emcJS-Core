import "../../polyfills/adoptedStyleSheet.polyfill.js";

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
