import Template from "/emcJS/util/html/Template.js";
import AbstractElement from "./AbstractElement.js";

const TPL_CAPTION = "NOT";
const TPL_BACKGROUND = "#ffdfe4";
const TPL_BORDER = "#ff0000";
const REFERENCE = "not";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
    </style>
    <div id="header" class="header">${TPL_CAPTION}</div>
    <div class="body">
        <slot id="child">
            <span id="droptarget" class="placeholder">...</span>
        </slot>
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
        const ch = this.children;
        if (ch[0]) {
            const val = ch[0].calculate(state);
            if (typeof val != "undefined") {
                value = +!val;
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

    toJSON() {
        return {
            type: REFERENCE,
            el: Array.from(this.children).slice(0, 1).map((e) => e.toJSON())[0]
        };
    }

    loadLogic(logic) {
        if (!!logic && !!logic.el) {
            let cl;
            if (logic.el.category) {
                cl = AbstractElement.getReference(logic.el.category, logic.el.type);
            } else {
                cl = AbstractElement.getReference(logic.el.type);
            }
            const el = new cl;
            el.loadLogic(logic.el);
            this.append(el);
        }
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`jse-logic-${REFERENCE}`, LogicElement);
