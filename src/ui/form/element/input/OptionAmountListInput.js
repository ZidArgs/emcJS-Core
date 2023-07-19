import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import "./components/AreaMarker.js";
import "./components/ConnectionMarker.js";
import "./components/ExitMarker.js";
import "./components/LocationMarker.js";
import TPL from "./OptionAmountListInput.js.html" assert {type: "html"};
import STYLE from "./OptionAmountListInput.js.css" assert {type: "css"};

/** visualization:
 * +---------------------------------+
 * | Search...                       | <-- filter list
 * +---------------------------------+
 * | +--------------------+--------+ |
 * | | Option 1           |      3 | | <-- interger input per option
 * | +--------------------+--------+ |
 * | | Option 2           |      0 | | <-- initial value is 0
 * | +--------------------+--------+ |
 * +---------------------------------+
 *
 * <option value="foobar">Foobar</option> substitution see "ImageSelect"
 */

/** target value output:
 * {
 *     [string=key]: [number=value]
 * }
 */

export default class OptionAmountListInput extends CustomElement {

    #xValue;

    #yValue;

    #mapElement;

    #posXInputElement;

    #posYInputElement;

    #currentMarkerType;

    #currentMarkerIndex;

    #currentMarkerLabel;

    #currentMarkerEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#mapElement = this.shadowRoot.getElementById("map");
        this.#posXInputElement = this.shadowRoot.getElementById("pos-x");
        this.#posYInputElement = this.shadowRoot.getElementById("pos-y");
        this.#mapElement.addEventListener("click", (event) => {
            const {offsetX, offsetY} = event;
            this.#posXInputElement.value = offsetX;
            this.#posYInputElement.value = offsetY;
            this.#xValue = offsetX;
            this.#yValue = offsetY;
            this.#handleCurrentMarker();
        });
        this.#posXInputElement.addEventListener("input", () => {
            const value = this.#posXInputElement.value;
            const xValue = parseInt(value);
            if (!isNaN(xValue)) {
                this.#xValue = xValue;
            } else {
                this.#xValue = null;
            }
            this.#handleCurrentMarker();
        });
        this.#posYInputElement.addEventListener("input", () => {
            const value = this.#posYInputElement.value;
            const yValue = parseInt(value);
            if (!isNaN(yValue)) {
                this.#yValue = yValue;
            } else {
                this.#yValue = null;
            }
            this.#handleCurrentMarker();
        });
        const removeButtonEl = this.shadowRoot.getElementById("remove");
        removeButtonEl.addEventListener("click", () => {
            this.#posXInputElement.value = "";
            this.#posYInputElement.value = "";
            this.#xValue = null;
            this.#yValue = null;
            this.#handleCurrentMarker();
        });
    }

    #onChange = debounce(() => {
        this.dispatchEvent(new Event("change"));
    });

    set value(value) {
        const {x, y} = value;
        const xValue = parseInt(x);
        const yValue = parseInt(y);
        if (!isNaN(xValue)) {
            this.#posXInputElement.value = x;
            this.#xValue = xValue;
        } else {
            this.#posXInputElement.value = "";
            this.#xValue = null;
        }
        if (!isNaN(yValue)) {
            this.#posYInputElement.value = y;
            this.#yValue = yValue;
        } else {
            this.#posYInputElement.value = "";
            this.#yValue = null;
        }
        this.#handleCurrentMarker();
    }

    get value() {
        if (this.#xValue != null && this.#yValue != null) {
            return {
                x: this.#xValue,
                y: this.#yValue
            };
        } else if (this.#xValue != null) {
            return {
                x: this.#xValue
            };
        } else if (this.#yValue != null) {
            return {
                y: this.#yValue
            };
        }
        return {};
    }

    loadData(map, connections, entries, currentType, currentIndex, currentLabel) {
        this.#currentMarkerType = currentType;
        this.#currentMarkerIndex = currentIndex;
        this.#currentMarkerLabel = currentLabel;
        this.innerHTML = "";
        if (map != null) {
            const {color, background, width, height} = map;
            this.#mapElement.style.backgroundColor = color;
            this.#mapElement.style.backgroundImage = `url("${background}")`;
            this.#mapElement.style.width = `${width}px`;
            this.#mapElement.style.height = `${height}px`;
            this.#posXInputElement.max = width;
            this.#posYInputElement.max = height;
            for (const index in connections ?? []) {
                const entry = connections[index];
                const {label, posA, posB} = entry;
                if (posA != null) {
                    this.#createMarker("connection", `${index}_0`, posA.x, posA.y, label);
                }
                if (posB != null) {
                    this.#createMarker("connection", `${index}_1`, posB.x, posB.y, label);
                }
            }
            for (const index in entries ?? []) {
                const entry = entries[index];
                const {pos, category} = entry;
                if (category != null && pos != null) {
                    this.#createMarker(category, index, pos.x, pos.y);
                }
            }
            this.#currentMarkerEl = this.querySelector(`[data-ref="${currentType}__${currentIndex}"]`);
            if (this.#currentMarkerEl) {
                this.#currentMarkerEl.classList.add("active");
            }
        } else {
            this.#mapElement.style.backgroundColor = "";
            this.#mapElement.style.backgroundImage = "";
            this.#mapElement.style.width = "0px";
            this.#mapElement.style.height = "0px";
            this.#posXInputElement.max = 0;
            this.#posYInputElement.max = 0;
        }
    }

    #createMarker(type, index, x, y, label) {
        if (!isNaN(x) && !isNaN(y)) {
            const el = document.createElement(`jse-world-editor-input-position-marker-${type}`);
            el.x = x;
            el.y = y;
            el.dataset.ref = `${type}__${index}`;
            if (label != null) {
                el.label = label;
            }
            this.append(el);
            return el;
        }
    }

    #handleCurrentMarker() {
        if (this.#xValue != null && this.#yValue != null) {
            if (this.#currentMarkerEl) {
                if (this.#currentMarkerEl.x != this.#xValue || this.#currentMarkerEl.y != this.#yValue) {
                    this.#currentMarkerEl.x = this.#xValue;
                    this.#currentMarkerEl.y = this.#yValue;
                    this.#onChange();
                }
            } else {
                this.#currentMarkerEl = this.#createMarker(this.#currentMarkerType, this.#currentMarkerIndex, this.#xValue, this.#yValue, this.#currentMarkerLabel);
                if (this.#currentMarkerEl) {
                    this.#currentMarkerEl.classList.add("active");
                    this.#onChange();
                }
            }
        } else if (this.#currentMarkerEl) {
            this.#currentMarkerEl.remove();
            this.#currentMarkerEl = null;
            this.#onChange();
        }
    }

}

customElements.define("emc-input-option-amount", OptionAmountListInput);
