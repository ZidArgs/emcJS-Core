const PX_REGEXP = /^[0-9]+(?:\.[0-9]+)?$/;

function getStyleLengthValue(value) {
    if (PX_REGEXP.test(value)) {
        return `${Math.max(parseFloat(value), 50)}px`;
    }
    return value;
}

class HeaderRendererManager extends EventTarget {

    #rendererStorage = new Map();

    registerRenderer(type, renderer) {
        if (type != null && typeof type !== "string") {
            throw new TypeError("type must be a string or null for default");
        }
        if (typeof renderer !== "function") {
            throw new TypeError("renderer must be a function");
        }
        this.#rendererStorage.set(type, renderer);
        const ev = new Event("cell");
        ev.data = {type};
        this.dispatchEvent(ev);
    }

    render(gridEl, headerEl, type, name, label, options = {}) {
        if (this.#rendererStorage.has(type)) {
            const renderFn = this.#rendererStorage.get(type);
            renderFn(gridEl, headerEl, label ?? name, options);
        } else if (this.#rendererStorage.has(null)) {
            const renderFn = this.#rendererStorage.get(null);
            renderFn(gridEl, headerEl, label ?? name, options);
        } else {
            headerEl.innerText = label ?? name;
        }
        if (options.width != null) {
            const width = getStyleLengthValue(options.width);
            headerEl.style.minWidth = width;
            headerEl.style.width = width;
        }
    }

}

const HeaderRenderer = new HeaderRendererManager();

HeaderRenderer.registerRenderer("empty", (gridEl, headerEl) => {
    headerEl.style.padding = "0px";
    headerEl.style.minWidth = "8px";
    headerEl.style.width = "8px";
    headerEl.innerText = "";
});

export default HeaderRenderer;
