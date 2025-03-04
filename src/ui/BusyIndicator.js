import CustomElement from "./element/CustomElement.js";
import ActiveCounter from "../util/ActiveCounter.js";
import TPL from "./BusyIndicator.js.html" assert {type: "html"};
import STYLE from "./BusyIndicator.js.css" assert {type: "css"};

// TODO test with 0 delay
const DOM_CHANGE_DELAY = 10;

export default class BusyIndicator extends CustomElement {

    #isActive = false;

    #targetEl = document.body;

    #activeCounter = new ActiveCounter();

    #promiseCounter = new ActiveCounter();

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
    }

    busy() {
        return new Promise((resolve) => {
            if (this.#activeCounter.add() && !this.#isActive) {
                this.#isActive = true;
                this.#targetEl.append(this);
                setTimeout(()=> {
                    resolve();
                }, DOM_CHANGE_DELAY);
            } else {
                resolve();
            }
        });
    }

    unbusy() {
        return new Promise((resolve) => {
            if (this.#activeCounter.remove() && this.#isActive) {
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
            if (this.#activeCounter.reset() && this.#isActive) {
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

    async promise(promise) {
        if (promise instanceof Promise) {
            await this.#busyPromise();
            try {
                const value = await promise;
                await this.#unbusyPromise();
                return value;
            } catch (error) {
                await this.#unbusyPromise();
                throw error;
            }
        }
        return promise;
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

    #busyPromise() {
        return new Promise((resolve) => {
            if (this.#promiseCounter.add() && !this.#isActive) {
                this.#isActive = true;
                this.#targetEl.append(this);
                setTimeout(()=> {
                    resolve();
                }, DOM_CHANGE_DELAY);
            } else {
                resolve();
            }
        });
    }

    #unbusyPromise() {
        return new Promise((resolve) => {
            if (this.#promiseCounter.remove() && this.#isActive) {
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

}

customElements.define("emc-busy-indicator", BusyIndicator);
