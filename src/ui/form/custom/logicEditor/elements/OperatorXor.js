import Template from "/emcJS/util/html/Template.js";
import AbstractElement from "./AbstractElement.js";

const TPL_CAPTION = "XOR";
const TPL_BACKGROUND = "#ffa500";
const TPL_BORDER = "#774455";
const REFERENCE = "xor";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
    </style>
    <div id="header" class="header">${TPL_CAPTION}</div>
    <div class="body">
        <slot id="child0" name="slot0">
            <span id="droptarget0" class="placeholder">...</span>
        </slot>
        <slot id="child1" name="slot1">
            <span id="droptarget1" class="placeholder">...</span>
        </slot>
    </div>
`);

export default class LogicElement extends AbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        const target0 = this.shadowRoot.getElementById("droptarget0");
        const target1 = this.shadowRoot.getElementById("droptarget1");
        target0.ondragover = AbstractElement.allowDrop;
        target1.ondragover = AbstractElement.allowDrop;
        target0.ondrop = AbstractElement.dropOnPlaceholder;
        target1.ondrop = AbstractElement.dropOnPlaceholder;
        target1.onclick = target0.onclick = (event) => {
            const e = new Event("placeholderclicked");
            e.name = event.target.name;
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
                value = +val;
            }
        }
        if (ch[1]) {
            const val = ch[1].calculate(state);
            if (typeof val != "undefined") {
                value = +(value != +val);
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

    update() {
        let newValue;
        const ch = this.children;
        if (!!ch[0] && typeof ch[0].value != "undefined") {
            if (!!ch[1] && typeof ch[1].value != "undefined") {
                newValue = +(!!ch[0].value != !!ch[1].value);
            } else {
                newValue = +!!ch[0].value;
            }
        }
        this.value = newValue;
    }

    toJSON() {
        return {
            type: REFERENCE,
            el: Array.from(this.children).slice(0, 2).map((e) => e.toJSON())
        };
    }

    loadLogic(logic) {
        if (!!logic && Array.isArray(logic.el)) {
            for (let i = 0; i < logic.el.length && i < 2; ++i) {
                const ch = logic.el[i];
                if (ch) {
                    let cl;
                    if (ch.category) {
                        cl = AbstractElement.getReference(ch.category, ch.type);
                    } else {
                        cl = AbstractElement.getReference(ch.type);
                    }
                    const el = new cl;
                    el.setAttribute("slot", `slot${i}`);
                    el.loadLogic(ch);
                    this.append(el);
                }
            }
        }
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`jse-logic-${REFERENCE}`, LogicElement);
