import AbstractElement from "./AbstractElement.js";
import TPL from "./AbstractOneChildElement.js.html" assert {type: "html"};

export default class AbstractOneChildElement extends AbstractElement {

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
            el: this.childList.map((e) => e.toJSON())[0]
        };
    }

    loadLogic(logic) {
        if (!!logic && !!logic.el) {
            let cl;
            if (logic.el.category) {
                cl = AbstractElement.getReference(logic.el.category, logic.el.type);
            } else {
                cl = AbstractElement.getReference(logic.el.type);
            }
            const el = new cl;
            el.loadLogic(logic.el);
            this.append(el);
        }
    }

    get childList() {
        const ch = Array.from(this.children).filter((el) => el instanceof AbstractElement);
        if (ch.length) {
            return [ch[0]];
        }
        return [];
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
