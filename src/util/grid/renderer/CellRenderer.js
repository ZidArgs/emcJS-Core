import DateUtil from "../../date/DateUtil.js";
import "../../../ui/form/button/Button.js";

class CellRendererManager extends EventTarget {

    #rendererStorage = new Map();

    registerRenderer(type, renderer) {
        if (type != null && typeof type !== "string") {
            throw new TypeError("type must be a string or null for default");
        }
        if (typeof renderer !== "function") {
            throw new TypeError("renderer must be a function");
        }
        this.#rendererStorage.set(type, renderer);
        const ev = new Event("header");
        ev.data = {type};
        this.dispatchEvent(ev);
    }

    render(gridEl, cellEl, type, name, data = {}, options = {}) {
        if (this.#rendererStorage.has(type)) {
            const renderFn = this.#rendererStorage.get(type);
            renderFn(gridEl, cellEl, data[name], options, name, data);
        } else if (this.#rendererStorage.has(null)) {
            const renderFn = this.#rendererStorage.get(null);
            renderFn(gridEl, cellEl, data[name], options, name, data);
        } else if (name in data) {
            cellEl.classList.remove("empty");
            cellEl.innerText = data[name];
        } else {
            cellEl.classList.add("empty");
            cellEl.innerText = "---";
        }
    }

}

const CellRenderer = new CellRendererManager();

CellRenderer.registerRenderer("empty", (gridEl, cellEl) => {
    cellEl.innerText = "";
});

CellRenderer.registerRenderer("boolean", (gridEl, cellEl, value) => {
    cellEl.style.textAlign = "center";
    if (value != null) {
        cellEl.classList.remove("empty");
        cellEl.innerText = !value || value === "false" ? "☐" : "☑";
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "☒";
    }
});

CellRenderer.registerRenderer("string", (gridEl, cellEl, value, options, name, data) => {
    if (options.editable != null && options.editable !== "false") {
        const fieldEl = document.createElement("input", {is: "emc-i18n-input"});
        fieldEl.type = "text";
        fieldEl.classList.add("input");
        if (value != null) {
            fieldEl.value = value;
        }
        const eventName = options.action;
        fieldEl.addEventListener("input", (event) => {
            event.stopPropagation();
            event.preventDefault();
            const ev = new Event(eventName ?? "input");
            ev.data = {
                fieldEl,
                value: fieldEl.value,
                name,
                data
            };
            gridEl.dispatchEvent(ev);
        });
        cellEl.appendChild(fieldEl);
    } else if (value == null) {
        cellEl.classList.add("empty");
    } else {
        cellEl.classList.remove("empty");
        cellEl.innerText = value;
    }
});

CellRenderer.registerRenderer("number", (gridEl, cellEl, value, options) => {
    cellEl.style.textAlign = "right";
    if (value == null) {
        cellEl.classList.add("empty");
    } else {
        cellEl.classList.remove("empty");
    }
    value = parseFloat(value) || 0;
    const {negativeColor, decimals} = options;
    if (negativeColor != null && value < 0) {
        cellEl.style.color = negativeColor;
    } else {
        cellEl.style.color = "";
    }
    if (decimals != null) {
        cellEl.innerText = value.toFixed(parseInt(decimals) || undefined);
    } else {
        cellEl.innerText = value;
    }
});

CellRenderer.registerRenderer("datetime", (gridEl, cellEl, value) => {
    cellEl.style.textAlign = "right";
    if (value != null) {
        if (!(value instanceof Date)) {
            value = new Date(value);
        }
        cellEl.classList.remove("empty");
        cellEl.innerText = DateUtil.convertLocal(value, "D.M.Y h:m:s");
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "n/a";
    }
});

CellRenderer.registerRenderer("date", (gridEl, cellEl, value) => {
    cellEl.style.textAlign = "right";
    if (value != null) {
        if (!(value instanceof Date)) {
            value = new Date(value);
        }
        cellEl.classList.remove("empty");
        cellEl.innerText = DateUtil.convertLocal(value, "D.M.Y");
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "n/a";
    }
});

CellRenderer.registerRenderer("time", (gridEl, cellEl, value) => {
    cellEl.style.textAlign = "right";
    if (value != null) {
        if (!(value instanceof Date)) {
            value = new Date(value);
        }
        cellEl.classList.remove("empty");
        cellEl.innerText = DateUtil.convertLocal(value, "h:m:s");
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "n/a";
    }
});

CellRenderer.registerRenderer("button", (gridEl, cellEl, value, options, name, data) => {
    cellEl.style.textAlign = "right";
    const buttonEl = document.createElement("emc-button");
    if (options.text != null) {
        buttonEl.text = options.text;
    } else if (value != null) {
        buttonEl.text = value;
    } else {
        buttonEl.text = "...";
    }
    const eventName = options.action;
    buttonEl.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const ev = new Event(eventName ?? "click");
        ev.data = {
            buttonEl,
            name,
            data
        };
        gridEl.dispatchEvent(ev);
    });
    cellEl.appendChild(buttonEl);
});

export default CellRenderer;
