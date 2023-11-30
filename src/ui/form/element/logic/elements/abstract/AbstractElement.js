import CustomElement from "../../../../../element/CustomElement.js";
import DragDropMemory from "../../../../../../data/DragDropMemory.js";
import {
    appUID
} from "../../../../../../util/helper/UniqueGenerator.js";
import TPL from "./AbstractElement.js.html" assert {type: "html"};
import STYLE from "./AbstractElement.js.css" assert {type: "css"};
import STYLE_ERROR from "./AbstractElement.js.ErrorElement.css" assert {type: "css"};

function dragStart(event) {
    DragDropMemory.clear();
    DragDropMemory.add(event.currentTarget);
    event.stopPropagation();
}

const REG = new Map();

export default class AbstractElement extends CustomElement {

    #id;

    constructor(caption) {
        if (new.target === AbstractElement) {
            throw new Error("can not construct abstract class");
        }
        /* --- */
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("header").innerText = caption;
        this.#id = appUID("logic-element");
        /* --- */
        this.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.editable) {
                const ev = new Event("menu", {bubbles: true, cancelable: true});
                ev.id = this.#id;
                ev.left = event.clientX;
                ev.top = event.clientY;
                this.dispatchEvent(ev);
            }
        });
    }

    connectedCallback() {
        if (this.getAttribute("tabindex") !== "0") {
            this.setAttribute("tabindex", "0");
        }
        if (this.draggable) {
            this.setAttribute("draggable", "true");
        } else {
            this.removeAttribute("draggable");
        }
        this.setAttribute("id", this.#id);
        this.addEventListener("dragstart", dragStart);
    }

    disconnectedCallback() {
        this.removeEventListener("dragstart", dragStart);
    }

    get draggable() {
        return !this.disabled && !this.readonly && (!this.template || this.template !== "clicked");
    }

    get editable() {
        return !this.disabled && !this.readonly && !this.template;
    }

    get id() {
        return this.#id;
    }

    getHeader() {
        const headerEl = this.shadowRoot.getElementById("header");
        if (headerEl) {
            return headerEl.innerText;
        }
    }

    getElement(forceCopy = false) {
        if (forceCopy || this.template) {
            const el = this.cloneNode(true);
            el.removeAttribute("template");
            return el;
        } else {
            return this;
        }
    }

    calculate(/* state = {} */) {
        throw new Error("can not call abstract method");
    }

    toJSON() {
        throw new Error("can not call abstract method");
    }

    loadLogic() {
        throw new Error("can not call abstract method");
    }

    append(el) {
        if (Array.isArray(el)) {
            el.forEach((e) => this.appendChild(e));
        } else {
            this.appendChild(el);
        }
    }

    prepend(el) {
        const firstEl = this.firstChild;
        if (firstEl == null) {
            this.append(el);
        } else if (Array.isArray(el)) {
            el.forEach((e) => firstEl.before(e));
        } else {
            firstEl.before(el);
        }
    }

    appendChild(el) {
        if (el instanceof AbstractElement && this.editable) {
            const r = super.appendChild(el);

            if (this.hasAttribute("visualize")) {
                r.setAttribute("visualize", this.getAttribute("visualize"));
            } else {
                r.removeAttribute("visualize");
            }
            if (this.hasAttribute("readonly")) {
                r.setAttribute("readonly", this.getAttribute("readonly"));
            } else {
                r.removeAttribute("readonly");
            }

            return r;
        }
    }

    insertBefore(el, ref) {
        if (el instanceof AbstractElement && this.editable) {
            const r = super.insertBefore(el, ref);

            if (this.hasAttribute("visualize")) {
                r.setAttribute("visualize", this.getAttribute("visualize"));
            } else {
                r.removeAttribute("visualize");
            }
            if (this.hasAttribute("readonly")) {
                r.setAttribute("readonly", this.getAttribute("readonly"));
            } else {
                r.removeAttribute("readonly");
            }

            return r;
        }
    }

    before(el) {
        const parentEl = this.parentElement;
        if (el instanceof AbstractElement && parentEl.editable) {
            super.before(el);

            if (parentEl.hasAttribute("visualize")) {
                el.setAttribute("visualize", parentEl.getAttribute("visualize"));
            } else {
                el.removeAttribute("visualize");
            }
            if (parentEl.hasAttribute("readonly")) {
                el.setAttribute("readonly", parentEl.getAttribute("readonly"));
            } else {
                el.removeAttribute("readonly");
            }
        }
    }

    after(el) {
        const parentEl = this.parentElement;
        if (el instanceof AbstractElement && parentEl.editable) {
            super.after(el);

            if (parentEl.hasAttribute("visualize")) {
                el.setAttribute("visualize", parentEl.getAttribute("visualize"));
            } else {
                el.removeAttribute("visualize");
            }
            if (parentEl.hasAttribute("readonly")) {
                el.setAttribute("readonly", parentEl.getAttribute("readonly"));
            } else {
                el.removeAttribute("readonly");
            }
        }
    }

    get childList() {
        return [];
    }

    set value(value) {
        const hdr = this.shadowRoot.querySelector(".header");
        if (typeof value == "undefined") {
            this.removeAttribute("value");
            if (hdr) {
                delete hdr.dataset.value;
            }
        } else if (typeof value == "boolean") {
            this.setAttribute("value", +value);
            if (hdr) {
                hdr.dataset.value = +value;
            }
        } else {
            this.setAttribute("value", parseInt(value) || 0);
            if (hdr) {
                hdr.dataset.value = parseInt(value) || 0;
            }
        }
    }

    get value() {
        const val = this.getAttribute("value");
        if (val == null) {
            return undefined;
        }
        return parseInt(val) || 0;
    }

    set disabled(val) {
        this.setBooleanAttribute("disabled", val);
    }

    get disabled() {
        return this.getBooleanAttribute("disabled");
    }

    set readonly(value) {
        this.setBooleanAttribute("readonly", value);
    }

    get readonly() {
        return this.getBooleanAttribute("readonly");
    }

    set template(value) {
        this.setBooleanAttribute("template", value);
    }

    get template() {
        return this.getBooleanAttribute("template");
    }

    static get observedAttributes() {
        return ["disabled", "readonly", "value", "visualize", "template"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "value": {
                if (oldValue != newValue) {
                    const event = new Event("update");
                    event.value = this.value;
                    this.dispatchEvent(event);
                }
            } break;
            case "visualize": {
                if (oldValue != newValue) {
                    for (const ch of this.children) {
                        ch.visualize = newValue;
                    }
                }
            } break;
            case "disabled": {
                if (oldValue != newValue) {
                    if (this.draggable) {
                        this.setAttribute("draggable", "true");
                    } else {
                        this.removeAttribute("draggable");
                    }
                    for (const ch of this.children) {
                        ch.disabled = newValue;
                    }
                }
            } break;
            case "readonly": {
                if (oldValue != newValue) {
                    if (this.draggable) {
                        this.setAttribute("draggable", "true");
                    } else {
                        this.removeAttribute("draggable");
                    }
                    for (const ch of this.children) {
                        ch.readonly = newValue;
                    }
                }
            } break;
            case "template": {
                if (oldValue != newValue) {
                    if (this.draggable) {
                        this.setAttribute("draggable", "true");
                    } else {
                        this.removeAttribute("draggable");
                    }
                }
            } break;
        }
    }

    static registerReference(ref, clazz) {
        if (REG.has(ref)) {
            throw new Error(`reference ${ref} already exists`);
        }
        REG.set(ref, clazz);
    }

    static getReference(...refs) {
        for (const ref of refs) {
            if (REG.has(ref)) {
                return REG.get(ref);
            }
        }
        return ErrorElement;
    }

    static buildLogic(logic) {
        if (typeof logic == "object" && !!logic) {
            if (Array.isArray(logic)) {
                return new ErrorElement();
            } else {
                let cl;
                if (logic.category) {
                    cl = AbstractElement.getReference(logic.category, logic.type);
                } else {
                    cl = AbstractElement.getReference(logic.type);
                }
                const el = new cl();
                el.loadLogic(logic);
                return el;
            }
        }
        return new (AbstractElement.getReference(`${logic}`));
    }

    static allowDrop(event) {
        const el = event.target.getRootNode().host;
        if (el.editable) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    static dropOnPlaceholder(event) {
        const els = DragDropMemory.get();
        if (els.length) {
            const el = els[0];
            if (!!el && el instanceof AbstractElement) {
                const ne = el.getElement(event.ctrlKey);
                if (ne) {
                    event.target.getRootNode().host.append(ne);
                    const slot = event.target.parentNode;
                    if (slot instanceof HTMLSlotElement && slot.name != null) {
                        ne.setAttribute("slot", slot.name);
                    } else {
                        ne.removeAttribute("slot");
                    }
                }
            }
        }
        DragDropMemory.clear();
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

}

class ErrorElement extends AbstractElement {

    constructor() {
        super("ERROR: REFERENCE NOT FOUND");
        STYLE_ERROR.apply(this.shadowRoot);
    }

    getElement() {
        return this;
    }

    get value() {
        return undefined;
    }

    calculate(/* state = {} */) {
        this.shadowRoot.getElementById("header").setAttribute("value", "0");
        return 0;
    }

    toJSON() {}

    loadLogic(logic) {
        this.shadowRoot.getElementById("body").innerHTML = logic.type || "UNKNOWN TYPE";
    }

}

customElements.define("emc-logic-error", ErrorElement);
