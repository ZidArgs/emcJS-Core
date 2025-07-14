import CustomElement from "../../element/CustomElement.js";
import DragDropMemory from "../../../data/DragDropMemory.js";
import {appUID} from "../../../util/helper/UniqueGenerator.js";
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

    #headerEl;

    constructor(caption) {
        if (new.target === AbstractElement) {
            throw new Error("can not construct abstract class");
        }
        /* --- */
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#headerEl = this.shadowRoot.getElementById("header");
        this.#headerEl.innerText = caption;
        this.#id = appUID("logic-element");
        /* --- */
        this.addEventListener("contextmenu", (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (this.editable) {
                const ev = new Event("menu", {
                    bubbles: true,
                    cancelable: true
                });
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
        if (this.#headerEl) {
            return this.#headerEl.innerText;
        }
    }

    getElement(forceCopy = false) {
        if (forceCopy || this.template) {
            const node = this.cloneNode(true);
            node.removeAttribute("template");
            return node;
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

    append(node) {
        if (Array.isArray(node)) {
            node.forEach((e) => this.appendChild(e));
        } else {
            this.appendChild(node);
        }
    }

    prepend(node) {
        const firstEl = this.firstChild;
        if (firstEl == null) {
            this.append(node);
        } else if (Array.isArray(node)) {
            node.forEach((e) => firstEl.before(e));
        } else {
            firstEl.before(node);
        }
    }

    appendChild(node) {
        if (node instanceof AbstractElement && this.editable) {
            const r = super.appendChild(node);

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

    insertBefore(node, ref) {
        if (node instanceof AbstractElement && this.editable) {
            const r = super.insertBefore(node, ref);

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

    before(node) {
        const parentEl = this.parentElement;
        if (node instanceof AbstractElement && parentEl.editable) {
            super.before(node);

            if (parentEl.hasAttribute("visualize")) {
                node.setAttribute("visualize", parentEl.getAttribute("visualize"));
            } else {
                node.removeAttribute("visualize");
            }
            if (parentEl.hasAttribute("readonly")) {
                node.setAttribute("readonly", parentEl.getAttribute("readonly"));
            } else {
                node.removeAttribute("readonly");
            }
        }
    }

    after(node) {
        const parentEl = this.parentElement;
        if (node instanceof AbstractElement && parentEl.editable) {
            super.after(node);

            if (parentEl.hasAttribute("visualize")) {
                node.setAttribute("visualize", parentEl.getAttribute("visualize"));
            } else {
                node.removeAttribute("visualize");
            }
            if (parentEl.hasAttribute("readonly")) {
                node.setAttribute("readonly", parentEl.getAttribute("readonly"));
            } else {
                node.removeAttribute("readonly");
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
                    const value = newValue != null && newValue != "false";
                    for (const ch of this.children) {
                        ch.visualize = value;
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
                    const value = newValue != null && newValue != "false";
                    for (const ch of this.children) {
                        ch.disabled = value;
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
                    const value = newValue != null && newValue != "false";
                    for (const ch of this.children) {
                        ch.readonly = value;
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
        console.error("logic element not found for references", ...refs);
        return ErrorElement;
    }

    static buildLogic(logic) {
        if (typeof logic === "object" && !!logic) {
            if (Array.isArray(logic)) {
                return new ErrorElement();
            } else {
                let cl;
                if (logic.category) {
                    cl = AbstractElement.getReference(logic.category, logic.type);
                } else {
                    cl = AbstractElement.getReference(logic.type);
                }
                const node = new cl();
                node.loadLogic(logic);
                return node;
            }
        }
        return new (AbstractElement.getReference(`${logic}`));
    }

    static allowDrop(event) {
        const node = event.target.getRootNode().host;
        if (node.editable) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    }

    static dropOnPlaceholder(event) {
        const nodes = DragDropMemory.get();
        if (nodes.length) {
            const node = nodes[0];
            if (!!node && node instanceof AbstractElement) {
                const ne = node.getElement(event.ctrlKey);
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

    checkValidity() {
        return true;
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

    checkValidity() {
        return false;
    }

}

customElements.define("emc-logic-error", ErrorElement);
