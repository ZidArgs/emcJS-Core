import {isEqual} from "../helper/Comparator.js";
import {getBoundingContentRect} from "../helper/html/ElementSizeHelper.js";
import StyleChangeObserver from "./StyleChangeObserver.js";

const OBSERVED_STYLES = [
    "position",
    "top",
    "bottom",
    "left",
    "right"
];

export default class StickyObserver {

    #rootEl;

    #callback;

    #observedEls = new Map();

    #styleChangeObserver;

    constructor(callback, {root = document.rootElement} = {}) {
        this.#callback = callback;
        this.#rootEl = root;
        root.addEventListener("scroll", () => {
            this.#refresh();
        });
        /* -- */
        this.#styleChangeObserver = new StyleChangeObserver((changedEls) => {
            const entries = [];
            const contentRect = getBoundingContentRect(this.#rootEl);
            for (const changedEl of changedEls) {
                const oldEntry = this.#observedEls.get(changedEl);
                const newEntry = this.#handleObservedElement(changedEl, contentRect);
                if (!isEqual(oldEntry, newEntry)) {
                    this.#observedEls.set(changedEl, newEntry);
                    entries.push(newEntry);
                }
            }
            if (entries.length > 0) {
                this.#callback(entries);
            }
        }, OBSERVED_STYLES);
    }

    #refresh() {
        const entries = this.takeRecords();
        if (entries.length > 0) {
            this.#callback(entries);
        }
    }

    observe(element) {
        if (!this.#observedEls.has(element)) {
            this.#styleChangeObserver.observe(element);
            const contentRect = getBoundingContentRect(this.#rootEl);
            const entry = this.#handleObservedElement(element, contentRect);
            this.#observedEls.set(element, entry);
            this.#callback([entry]);
        }
    }

    unobserve(element) {
        if (this.#observedEls.has(element)) {
            this.#observedEls.delete(element);
            this.#styleChangeObserver.unobserve(element);
        }
    }

    disconnect() {
        this.#observedEls.clear();
        this.#styleChangeObserver.disconnect();
    }

    takeRecords() {
        const entries = [];
        const contentRect = getBoundingContentRect(this.#rootEl);
        for (const [observedEl, oldEntry] of this.#observedEls) {
            const newEntry = this.#handleObservedElement(observedEl, contentRect);
            if (!isEqual(oldEntry, newEntry)) {
                this.#observedEls.set(observedEl, newEntry);
                entries.push(newEntry);
            }
        }
        return entries;
    }

    #handleObservedElement(observedEl, contentRect) {
        const observedStyle = this.#styleChangeObserver.getStyle(observedEl);
        const entry = {
            target: observedEl,
            isStuck: false,
            stuckPositions: {
                top: false,
                bottom: false,
                left: false,
                right: false
            }
        };
        if (observedStyle.position !== "sticky") {
            return entry;
        }

        const observedRect = observedEl.getBoundingClientRect();
        // get top stuck
        const styleTop = parseFloat(observedStyle.top);
        if (!isNaN(styleTop)) {
            if (observedRect.top <= contentRect.top + styleTop) {
                entry.isStuck = true;
                entry.stuckPositions.top = true;
            }
        }
        // get bottom stuck
        const styleBottom = parseFloat(observedStyle.bottom);
        if (!isNaN(styleBottom)) {
            if (observedRect.bottom >= contentRect.bottom - styleBottom) {
                entry.isStuck = true;
                entry.stuckPositions.bottom = true;
            }
        }
        // get left stuck
        const styleLeft = parseFloat(observedStyle.left);
        if (!isNaN(styleLeft)) {
            if (observedRect.left <= contentRect.left + styleLeft) {
                entry.isStuck = true;
                entry.stuckPositions.left = true;
            }
        }
        // get right stuck
        const styleRight = parseFloat(observedStyle.right);
        if (!isNaN(styleRight)) {
            if (observedRect.right >= contentRect.right - styleRight) {
                entry.isStuck = true;
                entry.stuckPositions.right = true;
            }
        }

        return entry;
    }

}
