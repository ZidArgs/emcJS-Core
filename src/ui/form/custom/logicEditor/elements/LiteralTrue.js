import Template from "/emcJS/util/html/Template.js";
import AbstractElement from "./AbstractElement.js";

const TPL_CAPTION = "TRUE";
const TPL_BACKGROUND = "#90ee90";
const TPL_BORDER = "#008000";
const REFERENCE = "true";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
    </style>
    <div id="header" class="header">${TPL_CAPTION}</div>
`);

export default class LogicElement extends AbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
    }

    calculate(/* state = {} */) {
        this.shadowRoot.getElementById("header").setAttribute("value", "1");
        return 1;
    }

    loadLogic(/* logic */) {}

    toJSON() {
        return {type: REFERENCE};
    }

}

AbstractElement.registerReference(REFERENCE, LogicElement);
customElements.define(`jse-logic-${REFERENCE}`, LogicElement);
