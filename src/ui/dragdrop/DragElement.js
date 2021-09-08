import DragDropMemory from "../../util/DragDropMemory.js";
import UniqueGenerator from "../../util/UniqueGenerator.js";
import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomElement from "../CustomElement.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-block;
    cursor: grab;
}
`);

function dragElement(event) {
    DragDropMemory.clear();
    DragDropMemory.add(event.currentTarget);
    event.stopPropagation();
}

export default class DragElement extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.id = UniqueGenerator.appUID("draggable");
        this.setAttribute("draggable", true);
        this.addEventListener("dragstart", dragElement);
    }

    get group() {
        return this.getAttribute("group");
    }

    set group(val) {
        this.setAttribute("group", val);
    }

}

customElements.define("emc-dragelement", DragElement);
