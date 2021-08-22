import Template from "../../../util/Template.js";
import GlobalStyle from "../../../util/GlobalStyle.js";

const TPL = new Template(`
<slot class="container top left" name="top-left"></slot>
<slot class="container top center" name="top-center"></slot>
<slot class="container top right" name="top-right"></slot>
<slot class="container bottom left" name="bottom-left"></slot>
<slot class="container bottom center" name="bottom-center"></slot>
<slot class="container bottom right" name="bottom-right"></slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    position: sticky;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-template-areas:
        "top-left top-center top-right"
        "bottom-left bottom-center bottom-right";
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    padding: 5px;
    z-index: 900700;
    cursor: default;
    pointer-events: none;
    overflow: hidden;
}
.container {
    position: absolute;
    display: flex;
    flex-direction: column;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex: 1;
    padding: 5px;
    pointer-events: none;
}
.container.top {
    justify-content: flex-start;
}
.container.bottom {
    justify-content: flex-end;
}
.container.left {
    align-items: flex-start;
}
.container.center {
    align-items: center;
}
.container.right {
    align-items: flex-end;
}
.container.top.left {
    grid-area: top-left;
}
.container.top.center {
    grid-area: top-center;
}
.container.top.right {
    grid-area: top-right;
}
.container.bottom.left {
    grid-area: bottom-left;
}
.container.bottom.center {
    grid-area: bottom-center;
}
.container.bottom.right {
    grid-area: bottom-right;
}
::slotted(*) {
    pointer-events: all;
}
`);

const LAYER = new Map();
let DEFAULT = null;

export default class MessageLayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        if (DEFAULT == null) {
            DEFAULT = this;
        }
    }

    set name(value) {
        this.setAttribute("name", value);
    }

    get name() {
        return this.getAttribute("name");
    }

    static get observedAttributes() {
        return ["name"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == "name" && newValue != oldValue) {
            if (LAYER.has(newValue)) {
                throw new Error(`MessageLayer with name "${name}" already exists`);
            }
            LAYER.set(newValue, this);
            if (LAYER.has(oldValue)) {
                LAYER.delete(oldValue);
            }
        }
    }

    setDefault() {
        DEFAULT = this;
    }

    static setDefault(name) {
        if (LAYER.has(name)) {
            DEFAULT = LAYER.get(name);
        }
    }

    static getDefault() {
        return DEFAULT;
    }

    static getLayer(name) {
        return LAYER.get(name);
    }

    static hasLayer(name) {
        return LAYER.has(name);
    }

    static append(element) {
        if (DEFAULT != null) {
            DEFAULT.append(element);
        }
    }

}

customElements.define("emc-messagelayer", MessageLayer);
