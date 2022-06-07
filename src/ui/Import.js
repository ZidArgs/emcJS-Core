import Import from "../import/Import.js";
import Template from "../util/html/Template.js";
import GlobalStyle from "../util/html/GlobalStyle.js";
import CustomElement from "./CustomElement.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: content;
}
`);

export default class HTMLImport extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get style() {
        return this.getAttribute("style");
    }

    set style(val) {
        this.setAttribute("style", val);
    }

    get html() {
        return this.getAttribute("html");
    }

    set html(val) {
        this.setAttribute("html", val);
    }

    get module() {
        return this.getAttribute("module");
    }

    set module(val) {
        this.setAttribute("module", val);
    }

    static get observedAttributes() {
        return ["style", "html", "module"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "style":
                if (oldValue != newValue) {
                    Import.addStyle(newValue);
                }
                break;
            case "html":
                if (oldValue != newValue) {
                    Import.html(newValue).then((result) => {
                        while (result.length > 0) {
                            this.append(result[0]);
                        }
                    });
                }
                break;
            case "module":
                if (oldValue != newValue) {
                    Import.addModule(newValue);
                }
                break;
        }
    }

}

customElements.define("emc-import", HTMLImport);
