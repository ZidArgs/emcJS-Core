import AbstractElement from "./AbstractElement.js";
import TPL from "./AbstractRestrictorElement.js.html" assert {type: "html"};
import STYLE from "./AbstractRestrictorElement.js.css" assert {type: "css"};

export default class AbstractRestrictorElement extends AbstractElement {

    #placeholderEl;

    #inputEl;

    #type;

    constructor(type, caption) {
        super(caption);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("body").append(els);
        this.#type = type;
        /* --- */
        this.#placeholderEl = this.shadowRoot.getElementById("droptarget");
        this.#placeholderEl.ondragover = AbstractElement.allowDrop;
        this.#placeholderEl.ondrop = AbstractElement.dropOnPlaceholder;
        this.#placeholderEl.onclick = (event) => {
            const e = new Event("placeholderclicked", {bubbles: true, cancelable: true});
            e.name = event.target.parentElement.name;
            this.dispatchEvent(e);
            event.stopPropagation();
        };
        this.#inputEl = this.shadowRoot.getElementById("input");
        this.#inputEl.onchange = () => {
            this.value = parseInt(this.#inputEl.value) || 0;
            this.dispatchEvent(new Event("valuechange", {bubbles: true, cancelable: true}));
        };
    }

    connectedCallback() {
        if (this.editable) {
            this.#placeholderEl.disabled = false;
            this.#inputEl.disabled = false;
        } else {
            this.#placeholderEl.disabled = true;
            this.#inputEl.disabled = true;
        }
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    getElement(forceCopy = false) {
        const node = super.getElement(forceCopy);
        node.value = this.value;
        return node;
    }

    toJSON() {
        return {
            type: this.#type,
            content: this.childList.map((e) => e.toJSON())[0],
            value: parseInt(this.value) || 0
        };
    }

    loadLogic(logic) {
        if (!!logic && !!logic.content) {
            this.value = parseInt(logic.value) || 0;
            let cl;
            if (logic.content.category) {
                cl = AbstractElement.getReference(logic.content.category, logic.content.type);
            } else {
                cl = AbstractElement.getReference(logic.content.type);
            }
            const node = new cl;
            node.loadLogic(logic.content);
            this.append(node);
        }
    }

    get childList() {
        const ch = Array.from(this.children).filter((node) => node instanceof AbstractElement);
        if (ch.length) {
            return [ch[0]];
        }
        return [];
    }

    static get observedAttributes() {
        const attr = AbstractElement.observedAttributes;
        attr.push("value");
        return attr;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "disabled":
            case "template": {
                if (oldValue != newValue) {
                    if (this.editable) {
                        this.#placeholderEl.disabled = false;
                        this.#inputEl.disabled = false;
                    } else {
                        this.#placeholderEl.disabled = true;
                        this.#inputEl.disabled = true;
                    }
                }
            } break;
            case "value": {
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("input").value = parseInt(newValue) || 0;
                }
            } break;
        }
    }

    checkValidity() {
        return this.childList.length === 1 && this.childList[0].checkValidity();
    }

}
