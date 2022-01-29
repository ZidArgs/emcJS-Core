import Template from "../../util/html/Template.js";
import GlobalStyle from "../../util/html/GlobalStyle.js";
import CustomElement from "../CustomElement.js";
import "./Option.js";

const TPL = new Template(`
<button id="prev">◀</button>
<slot></slot>
<button id="next">▶</button>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-flex;
    width: 80px;
    user-select: none;
}
:host(:not([readonly])),
:host([readonly="false"]) {
    cursor: pointer;
}
button {
    display: block;
    width: 40px;
    margin: 0;
    padding: 10px;
    flex-shrink: 0;
    border: none;
    background: none;
    color: inherit;
    cursor: pointer;
    opacity: 0.5;
    -webkit-appearance: none;
}
button:hover {
    opacity: 1;
}
button::after {
    display: block;
    border-top: solid 10px transparent;
    border-bottom: solid 10px transparent;
    content: "";
}
button#prev::after {
    border-right: solid 20px white;
}
button#next::after {
    border-left: solid 20px white;
}
slot {
    flex: 1;
    height: 100%;
}
::slotted(:not([value])),
::slotted([value]:not(.active)) {
    display: none !important;
}
::slotted([value]) {
    width: 100%;
    height: 100%;
    min-height: auto;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
}
`);

function getNextElement(all, current) {
    if (!current.nextElementSibling) {
        return all[all.length - 1];
    } else {
        return current.nextElementSibling;
    }
}

function getPrevElement(all, current) {
    if (!current.previousElementSibling) {
        return all[all.length - 1];
    } else {
        return current.previousElementSibling;
    }
}

export default class CircleSelect extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        // button events
        this.shadowRoot.getElementById("next").addEventListener("click", event => {
            this.next(event);
        });
        this.shadowRoot.getElementById("prev").addEventListener("click", event => {
            this.prev(event);
        });
    }

    connectedCallback() {
        if (!this.value) {
            const all = this.querySelectorAll("[value]");
            if (all.length) {
                this.value = all[0].value;
            }
        }
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    get readonly() {
        const val = this.getAttribute("readonly");
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute("readonly", val);
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value":
                if (oldValue != newValue) {
                    const oe = this.querySelector(`.active`);
                    if (oe) {
                        oe.classList.remove("active");
                    }
                    const ne = this.querySelector(`[value="${newValue}"]`);
                    if (ne) {
                        ne.classList.add("active");
                    }
                    const event = new Event("change");
                    event.oldValue = oldValue;
                    event.newValue = newValue;
                    event.value = newValue;
                    this.dispatchEvent(event);
                }
                break;
        }
    }

    next(ev) {
        if (!this.readonly) {
            const all = this.querySelectorAll("[value]");
            if (all.length) {
                const opt = this.querySelector(`[value="${this.value}"]`);
                if (opt) {
                    let next = getNextElement(all, opt);
                    let da = next.getAttribute("disabled");
                    while (!da || da == "false" || next == opt) {
                        next = getNextElement(all, opt);
                        da = next.getAttribute("disabled");
                    }
                    this.value = next.getAttribute("value");
                }
            }
        }
        ev.preventDefault();
        return false;
    }

    prev(ev) {
        if (!this.readonly) {
            const all = this.querySelectorAll("[value]");
            if (all.length) {
                const opt = this.querySelector(`[value="${this.value}"]`);
                if (opt) {
                    let next = getPrevElement(all, opt);
                    let da = next.getAttribute("disabled");
                    while (!da || da == "false" || next == opt) {
                        next = getPrevElement(all, opt);
                        da = next.getAttribute("disabled");
                    }
                    this.value = next.getAttribute("value");
                }
            }
        }
        ev.preventDefault();
        return false;
    }

}

customElements.define("emc-circleselect", CircleSelect);
