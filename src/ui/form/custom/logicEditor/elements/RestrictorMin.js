import Template from "/emcJS/util/html/Template.js";
import AbstractElement from "./AbstractElement.js";

const TPL_CAPTION = "MIN";
const TPL_BACKGROUND = "#9affec";
const TPL_BORDER = "#51978a";
const REFERENCE = "min";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
    </style>
    <div id="header" class="header">${TPL_CAPTION}</div>
    <div class="body">
        <input id="input" type="number" value="0" />
    </div>
    <div class="body">
        <slot id="children">
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
        const input = this.shadowRoot.getElementById("input");
        input.onchange = () => {
            this.value = parseInt(input.value) || 0;
        };
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    getElement(forceCopy = false) {
        const el = super.getElement(forceCopy);
        el.value = this.value;
        return el;
    }

    calculate(state = {}) {
        let value;
        const ch = this.children;
        if (ch[0]) {
            const val = ch[0].calculate(state);
            if (typeof val != "undefined") {
                value = +(val >= (parseInt(this.value) || 0));
            }
        }
        this.shadowRoot.getElementById("header").setAttribute("value", value);
        return value;
    }

    loadLogic(logic) {
        if (!!logic && !!logic.el) {
            this.value = parseInt(logic.value) || 0;
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

    toJSON() {
        return {
            type: REFERENCE,
            el: Array.from(this.children).slice(0, 1).map((e) => e.toJSON())[0],
            value: parseInt(this.value) || 0
        };
    }

    static get observedAttributes() {
        const attr = AbstractElement.observedAttributes;
        attr.push("value");
        return attr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "readonly":
                if (oldValue != newValue) {
                    const input = this.shadowRoot.getElementById("input");
                    if (newValue != null) {
                        input.setAttribute("disabled", newValue);
                    } else {
                        input.removeAttribute("disabled");
                    }
                }
                break;
            case "value":
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("input").value = parseInt(newValue) || 0;
                }
                break;
        }
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`jse-logic-${REFERENCE}`, LogicElement);
