import Template from "/emcJS/util/html/Template.js";
import AbstractElement from "./AbstractElement.js";

const TPL_CAPTION = "NAND";
const TPL_BG_0 = "#ffffe0";
const TPL_BG_1 = "#ffdfe4";
const TPL_BACKGROUND = `repeating-linear-gradient(145deg, ${TPL_BG_0}, ${TPL_BG_0} 20px, ${TPL_BG_1} 20px, ${TPL_BG_1} 40px)`;
const TPL_BORDER = "#ffa500";
const REFERENCE = "nand";

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

    visualizeValue() {
        if (this.children.length > 0) {
            const values = Array.from(this.children).map((el) => {
                return el.visualizeValue();
            });
            if (values.some((v) => v === false)) {
                this.shadowRoot.querySelector(".header").dataset.value = "true";
                return true;
            }
            if (values.some((v) => v === true)) {
                this.shadowRoot.querySelector(".header").dataset.value = "false";
                return false;
            }
        }
        this.shadowRoot.querySelector(".header").dataset.value = "";
    }

    calculate(state = {}) {
        let value;
        const ch = Array.from(this.children).map((el) => el.calculate(state));
        for (const val of ch) {
            if (typeof val != "undefined") {
                value = +!val;
                if (!value) {
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
