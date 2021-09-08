import DragDropMemory from "../../util/DragDropMemory.js";
import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomElement from "../CustomElement.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
:host {
    display: block;
    height: 100%;
}
`);

function dropElement(event) {
    const els = DragDropMemory.get();
    if (els.length) {
        this.append(els);
    }
    DragDropMemory.clear();
    event.preventDefault();
    event.stopPropagation();
}

function allowDrop(event) {
    const els = DragDropMemory.get();
    if (!this.group) {
        event.preventDefault();
        event.stopPropagation();
    } else if (els.every(e => e.group == this.group)) {
        event.preventDefault();
        event.stopPropagation();
    }
}

export default class DropTarget extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.ondrop = dropElement.bind(this);
        this.ondragover = allowDrop.bind(this);
    }

    get group() {
        return this.getAttribute("group");
    }

    set group(val) {
        this.setAttribute("group", val);
    }

}

customElements.define("emc-droptarget", DropTarget);
