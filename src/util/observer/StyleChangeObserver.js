import {isEqual} from "../helper/Comparator.js";
import {getComputedStyleProperties} from "../helper/html/ElementStyleHelper.js";

const OBSERVED_MUTATIONS = {
    attributes: true,
    attributeFilter: ["style", "class"]
};

export default class StyleChangeObserver {

    #callback;

    #mutationObserver;

    #observedProperties;

    #observedEls = new Map();

    constructor(callback, observedStyleProperties = []) {
        this.#callback = callback;
        this.#observedProperties = observedStyleProperties;
        this.#mutationObserver = new MutationObserver((mutationList) => {
            this.#refresh(mutationList);
        });
    }

    #refresh(mutationList) {
        const entries = [];
        for (const mutation of mutationList) {
            const element = mutation.target;
            const oldStyle = this.#observedEls.get(element);
            const newStyle = getComputedStyleProperties(element, this.#observedProperties);
            if (!isEqual(oldStyle, newStyle)) {
                this.#observedEls.set(element, newStyle);
                entries.push(element);
            }
        }
        if (entries.length > 0) {
            this.#callback(entries);
        }
    }

    observe(element) {
        if (!this.#observedEls.has(element)) {
            const observedStyle = getComputedStyleProperties(element, this.#observedProperties);
            this.#observedEls.set(element, observedStyle);
            this.#mutationObserver.observe(element, OBSERVED_MUTATIONS);
        }
    }

    unobserve(element) {
        if (this.#observedEls.has(element)) {
            this.#observedEls.delete(element);
            this.#mutationObserver.disconnect();
            for (const [observedEl] of this.#observedEls) {
                this.#mutationObserver.observe(observedEl);
            }
        }
    }

    disconnect() {
        this.#observedEls.clear();
        this.#mutationObserver.disconnect();
    }

    getStyle(element) {
        if (this.#observedEls.has(element)) {
            return {...this.#observedEls.get(element)};
        }
        return null;
    }

}
