import AbstractElement from "./AbstractElement.js";
import TPL from "./AbstractInfChildrenElement.js.html" assert {type: "html"};

export default class AbstractInfChildrenElement extends AbstractElement {

    #placeholderEl;

    #type;

    constructor(type, caption) {
        super(caption);
        const els = TPL.generate();
        /* --- */
        this.shadowRoot.getElementById("body").append(els);
        this.#type = type;
        /* --- */
        this.#placeholderEl = this.shadowRoot.getElementById("droptarget");
        this.#placeholderEl.ondragover = AbstractElement.allowDrop;
        this.#placeholderEl.ondrop = AbstractElement.dropOnPlaceholder;
        this.#placeholderEl.onclick = (event) => {
            const e = new Event("placeholderclicked", {bubbles: true, cancelable: true});
            this.dispatchEvent(e);
            event.stopPropagation();
        };
    }

    toJSON() {
        return {
            type: this.#type,
            el: this.childList.map((e) => e.toJSON())
        };
    }

    loadLogic(logic) {
        if (!!logic && Array.isArray(logic.el)) {
            logic.el.forEach((ch) => {
                if (ch) {
                    let cl;
                    if (ch.category) {
                        cl = AbstractElement.getReference(ch.category, ch.type);
                    } else {
                        cl = AbstractElement.getReference(ch.type);
                    }
                    const el = new cl;
                    el.loadLogic(ch);
                    this.append(el);
                }
            });
        }
    }

    get childList() {
        return Array.from(this.children).filter((el) => el instanceof AbstractElement);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case "disabled":
            case "template":
            case "readonly": {
                if (oldValue != newValue) {
                    if (this.editable) {
                        this.#placeholderEl.disabled = false;
                    } else {
                        this.#placeholderEl.disabled = true;
                    }
                }
            } break;
        }
    }

}
