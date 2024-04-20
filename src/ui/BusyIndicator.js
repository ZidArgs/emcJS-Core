import CustomElement from "./element/CustomElement.js";
import ActiveCounter from "../util/ActiveCounter.js";
import TPL from "./BusyIndicator.js.html" assert {type: "html"};
import STYLE from "./BusyIndicator.js.css" assert {type: "css"};

export default class BusyIndicator extends CustomElement {

    #isActive = false;

    #targetEl = document.body;

    #activeCounter = new ActiveCounter();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    busy() {
        return new Promise((resolve) => {
            if (this.#activeCounter.add()) {
                this.#isActive = true;
                this.#targetEl.append(this);
                setTimeout(()=> {
                    resolve();
                }, 10);
            } else {
                resolve();
            }
        });
    }

    unbusy() {
        return new Promise((resolve) => {
            if (this.#activeCounter.remove()) {
                this.#isActive = false;
                this.remove();
                setTimeout(()=> {
                    resolve();
                }, 0);
            } else {
                resolve();
            }
        });
    }

    reset() {
        return new Promise((resolve) => {
            if (this.#activeCounter.reset()) {
                this.#isActive = false;
                this.remove();
                setTimeout(()=> {
                    resolve();
                }, 0);
            } else {
                resolve();
            }
        });
    }

    setTarget(element) {
        if (element instanceof HTMLElement || element instanceof ShadowRoot) {
            this.#targetEl = element;
        } else {
            this.#targetEl = document.body;
        }
        if (this.#isActive) {
            this.#targetEl.append(this);
        }
    }

}

customElements.define("emc-busy-indicator", BusyIndicator);
