import DateUtil from "../date/DateUtil.js";

function getStyleLengthValue(value) {
    if (!isNaN(parseFloat(value))) {
        return `${value}px`;
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

    renderCell(cellEl, type, name, data = {}, options = {}) {
        if (this.#cellRendererStorage.has(type)) {
            const renderFn = this.#cellRendererStorage.get(type);
            renderFn(cellEl, data[name], options);
        } else if (this.#cellRendererStorage.has(null)) {
            const renderFn = this.#cellRendererStorage.get(null);
            renderFn(cellEl, data[name], options);
        } else if (name in data) {
            cellEl.classList.remove("empty");
            cellEl.innerText = data[name];
        } else {
            cellEl.classList.add("empty");
            cellEl.innerText = "---";
        }
    }

    renderHeader(headerEl, type, name, label, options = {}) {
        if (this.#headerRendererStorage.has(type)) {
            const renderFn = this.#headerRendererStorage.get(type);
            renderFn(headerEl, label ?? name, options);
        } else if (this.#headerRendererStorage.has(null)) {
            const renderFn = this.#headerRendererStorage.get(null);
            renderFn(headerEl, label ?? name, options);
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

CellRenderer.registerCellRenderer("empty", (cellEl) => {
    cellEl.innerText = "";
});

CellRenderer.registerHeaderRenderer("empty", (cellEl) => {
    cellEl.style.padding = "0px";
    cellEl.style.minWidth = "8px";
    cellEl.style.width = "8px";
    cellEl.innerText = "";
});

CellRenderer.registerCellRenderer("boolean", (cellEl, value) => {
    cellEl.style.textAlign = "center";
    if (value != null) {
        cellEl.classList.remove("empty");
        cellEl.innerText = !value || value === "false" ? "☐" : "☑";
    } else {
        cellEl.classList.add("empty");
        cellEl.innerText = "☒";
    }
});

CellRenderer.registerCellRenderer("number", (cellEl, value, options) => {
    cellEl.style.textAlign = "end";
    /* --- */
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

CellRenderer.registerCellRenderer("datetime", (cellEl, value) => {
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

CellRenderer.registerCellRenderer("date", (cellEl, value) => {
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

CellRenderer.registerCellRenderer("time", (cellEl, value) => {
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

export default CellRenderer;
