import CustomElementDelegating from "./CustomElementDelegating.js";
import TPL from "./FocusKeeper.js.html" assert {type: "html"};
import STYLE from "./FocusKeeper.js.css" assert {type: "css"};

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

export default class FocusKeeper extends CustomElementDelegating {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("focus", () => {
            const el = this.querySelector(Q_TAB);
            if (el != null) {
                el.focus();
            }
        });
    }

    focus(options) {
        const el = this.querySelector(Q_TAB);
        if (el != null) {
            el.focus(options);
        }
    }

    connectedCallback() {
        this.setAttribute("tabindex", 0);
    }

    static get observedAttributes() {
        return ["tabindex"];
    }

    attributeChangedCallback(name) {
        if (name === "tabindex") {
            this.setAttribute("tabindex", 0);
        }
    }

}

customElements.define("emc-focus", FocusKeeper);
