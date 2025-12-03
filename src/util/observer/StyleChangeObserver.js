import {isEqual} from "../helper/Comparator.js";
import {getComputedStyleProperties} from "../helper/html/ElementStyleHelper.js";

const OBSERVED_MUTATIONS = {
    attributes: true,
    attributeFilter: ["style", "class"]
};

export default class StyleChangeObserver {

    #callback;

    #mutationObserver;

    #blacklistedClasses = new Set();

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
            const elementData = this.#observedEls.get(element);
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
                const currentClasses = new Set(element.classList);
                const classDiff = currentClasses.symmetricDifference(elementData.classList);
                if (classDiff.isSubsetOf(this.#blacklistedClasses)) {
                    continue;
                }
            }
            const newStyle = getComputedStyleProperties(element, this.#observedProperties);
            if (!isEqual(elementData.oldStyle, newStyle)) {
                elementData.style = newStyle;
                entries.push(element);
            }
        }
        if (entries.length > 0) {
            this.#callback(entries);
        }
    }

    async observe(element) {
        if (!this.#observedEls.has(element)) {
            const observedStyle = getComputedStyleProperties(element, this.#observedProperties);
            this.#observedEls.set(element, {
                classList: new Set(element.classList),
                style: observedStyle
            });
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
            return {...this.#observedEls.get(element).style};
        }
        return null;
    }

    blacklistClass(name) {
        this.#blacklistedClasses.add(name);
    }

    unblacklistClass(name) {
        this.#blacklistedClasses.delete(name);
    }

}
