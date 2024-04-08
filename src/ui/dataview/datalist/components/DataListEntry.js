import CustomElement from "/emcJS/ui/element/CustomElement.js";
import TPL from "./DataListEntry.js.html" assert {type: "html"};
import STYLE from "./DataListEntry.js.css" assert {type: "css"};

export default class DataListEntry extends CustomElement {

    #containerEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
    }

    setData(data) {
        this.#containerEl.innerText = JSON.stringify(data);
    }

    set key(value) {
        this.setAttribute("key", value);
    }

    get key() {
        return this.getAttribute("key");
    }

}

customElements.define("emc-datalist-entry", DataListEntry);
