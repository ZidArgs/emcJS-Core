import DateUtil from "../date/DateUtil.js";
import "../../ui/form/button/Button.js";

const PX_REGEXP = /^[0-9]+(?:\.[0-9]+)?$/;

function getStyleLengthValue(value) {
    if (PX_REGEXP.test(value)) {
        return `${Math.max(parseFloat(value), 50)}px`;
    }
    return value;
}

class CellRendererManager extends EventTarget {

    #cellRendererStorage = new Map();

    #headerRendererStorage = new Map();

    registerCellRenderer(type, renderer) {
        if (type != null && typeof type !== "string") {
            throw new TypeError("type must be a string or null for default");
        }
        if (typeof renderer !== "function") {
            throw new TypeError("renderer must be a function");
        }
        this.#cellRendererStorage.set(type, renderer);
        const ev = new Event("header");
        ev.data = {type};
        this.dispatchEvent(ev);
    }

    registerHeaderRenderer(type, renderer) {
        if (type != null && typeof type !== "string") {
            throw new TypeError("type must be a string or null for default");
        }
        if (typeof renderer !== "function") {
            throw new TypeError("renderer must be a function");
        }
        this.#headerRendererStorage.set(type, renderer);
        const ev = new Event("cell");
        ev.data = {type};
        this.dispatchEvent(ev);
    }

    renderCell(gridEl, cellEl, type, name, data = {}, options = {}) {
        if (this.#cellRendererStorage.has(type)) {
            const renderFn = this.#cellRendererStorage.get(type);
            renderFn(gridEl, cellEl, data[name], options, name, data);
        } else if (this.#cellRendererStorage.has(null)) {
            const renderFn = this.#cellRendererStorage.get(null);
            renderFn(gridEl, cellEl, data[name], options, name, data);
        } else if (name in data) {
            cellEl.classList.remove("empty");
            cellEl.innerText = data[name];
        } else {
            cellEl.classList.add("empty");
            cellEl.innerText = "---";
        }
    }

    renderHeader(gridEl, headerEl, type, name, label, options = {}) {
        if (this.#headerRendererStorage.has(type)) {
            const renderFn = this.#headerRendererStorage.get(type);
            renderFn(gridEl, headerEl, label ?? name, options);
        } else if (this.#headerRendererStorage.has(null)) {
            const renderFn = this.#headerRendererStorage.get(null);
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

const CellRenderer = new CellRendererManager();

CellRenderer.registerCellRenderer("empty", (gridEl, cellEl) => {
    cellEl.innerText = "";
});

CellRenderer.registerHeaderRenderer("empty", (gridEl, cellEl) => {
    cellEl.style.padding = "0px";
    cellEl.style.minWidth = "8px";
    cellEl.style.width = "8px";
    cellEl.innerText = "";
});

CellRenderer.registerCellRenderer("boolean", (gridEl, cellEl, value) => {
    cellEl.style.textAlign = "center";
    if (value != null) {
        cellEl.classList.remove("empty");
        cellEl.innerText = !value || value === "false" ? "☐" : "☑";
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "☒";
    }
});

CellRenderer.registerCellRenderer("string", (gridEl, cellEl, value, options, name, data) => {
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

CellRenderer.registerCellRenderer("number", (gridEl, cellEl, value, options) => {
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

CellRenderer.registerCellRenderer("datetime", (gridEl, cellEl, value) => {
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

CellRenderer.registerCellRenderer("date", (gridEl, cellEl, value) => {
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

CellRenderer.registerCellRenderer("time", (gridEl, cellEl, value) => {
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

CellRenderer.registerCellRenderer("button", (gridEl, cellEl, value, options, name, data) => {
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
