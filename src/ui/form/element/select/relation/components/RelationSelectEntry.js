import CustomElement from "../../../../../element/CustomElement.js";
import TPL from "./RelationSelectEntry.js.html" assert {type: "html"};
import STYLE from "./RelationSelectEntry.js.css" assert {type: "css"};

export default class RelationSelectEntry extends CustomElement {

    #nameEl;

    #typeEl;

    #tooltipEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#nameEl = this.shadowRoot.getElementById("name");
        this.#typeEl = this.shadowRoot.getElementById("type");
        this.#tooltipEl = this.shadowRoot.getElementById("tooltip");
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    set type(value) {
        this.setAttribute("type", value);
    }

    get type() {
        return this.getAttribute("type");
    }

    get value() {
        return {
            "type": this.type ?? "",
            "name": this.name ?? ""
        };
    }

    static get observedAttributes() {
        return ["name", "type"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "name": {
                if (oldValue != newValue) {
                    this.#nameEl.i18nValue = newValue;
                    this.#tooltipEl.i18nTooltip = newValue;
                }
            } break;
            case "type": {
                if (oldValue != newValue) {
                    this.#typeEl.i18nValue = newValue;
                }
            } break;
        }
    }

    get comparatorText() {
        if (!this.name || !this.type) {
            return "";
        }
        return `${this.#nameEl.innerText}\n${this.#typeEl.innerText}`;
    }

}

customElements.define("emc-select-relation-entry", RelationSelectEntry);
