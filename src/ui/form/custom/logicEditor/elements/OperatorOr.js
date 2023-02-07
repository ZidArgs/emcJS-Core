import Template from "/emcJS/util/html/Template.js";
import AbstractElement from "./AbstractElement.js";

const TPL_CAPTION = "OR";
const TPL_BACKGROUND = "#bcdefb";
const TPL_BORDER = "#37a3ff";
const REFERENCE = "or";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
    </style>
    <div id="header" class="header">${TPL_CAPTION}</div>
    <div class="body">
        <slot id="children"></slot>
        <span id="droptarget" class="placeholder">...</span>
    </div>
`);

export default class LogicElement extends AbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        const target = this.shadowRoot.getElementById("droptarget");
        target.ondragover = AbstractElement.allowDrop;
        target.ondrop = AbstractElement.dropOnPlaceholder;
        target.onclick = (event) => {
            const e = new Event("placeholderclicked", {bubbles: true, cancelable: true});
            e.name = event.target.parentElement.name;
            this.dispatchEvent(e);
            event.stopPropagation();
        };
    }

    calculate(state = {}) {
        let value;
        const ch = Array.from(this.children).map((el) => el.calculate(state));
        for (const val of ch) {
            if (typeof val != "undefined") {
                value = +!!val;
                if (value) {
                    break;
                }
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

    toJSON() {
        return {
            type: REFERENCE,
            el: Array.from(this.children).map((e) => e.toJSON())
        };
    }

    loadLogic(logic) {
        if (!!logic && Array.isArray(logic.el)) {
            logic.el.forEach((ch) => {
                if (ch) {
                    let cl;
                    if (ch.category) {
                        cl = AbstractElement.getReference(ch.category, ch.type);
                    } else {
                        cl = AbstractElement.getReference(ch.type);
                    }
                    const el = new cl;
                    el.loadLogic(ch);
                    this.append(el);
                }
            });
        }
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`jse-logic-${REFERENCE}`, LogicElement);
