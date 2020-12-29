import DragDropMemory from "../../util/DragDropMemory.js";
import UniqueGenerator from "../../util/UniqueGenerator.js";
import Template from "../../util/Template.js";
import GlobalStyle from "../../util/GlobalStyle.js";

const TPL = new Template(`
<slot></slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
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

export default class DragElement extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.id = UniqueGenerator.appUID("draggable");
        this.setAttribute("draggable", true);
        this.addEventListener("dragstart", dragElement);
    }

    get group() {
        return this.getAttribute('group');
    }

    set group(val) {
        this.setAttribute('group', val);
    }

}

customElements.define('emc-dragelement', DragElement);
