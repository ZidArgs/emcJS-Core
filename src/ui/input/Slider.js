import CustomElement from "../element/CustomElement.js";
import TPL from "./Slider.js.html" assert {type: "html"};
import STYLE from "./Slider.js.css" assert {type: "css"};

export default class Slider extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const sliderEl = this.shadowRoot.getElementById("slider");
        sliderEl.addEventListener("change", (event) => {
            const value = parseInt(sliderEl.value);
            this.setAttribute("value", value);
            const ev = new Event("change");
            ev.value = value;
            this.dispatchEvent(ev);
            event.stopPropagation();
        });
        sliderEl.addEventListener("input", (event) => {
            const value = parseInt(sliderEl.value);
            this.setAttribute("value", value);
            const ev = new Event("input");
            ev.value = value;
            this.dispatchEvent(ev);
            event.stopPropagation();
        });
    }

    get min() {
        return this.getAttribute("min");
    }

    set min(val) {
        this.setAttribute("min", val);
    }

    get max() {
        return this.getAttribute("max");
    }

    set max(val) {
        this.setAttribute("max", val);
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static get observedAttributes() {
        return ["min", "max", "value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const sliderEl = this.shadowRoot.getElementById("slider");
            switch (name) {
                case "min": {
                    sliderEl.min = newValue;
                } break;
                case "max": {
                    sliderEl.max = newValue;
                } break;
                case "value": {
                    sliderEl.value = newValue;
                } break;
            }
        }
    }

}

customElements.define("emc-slider", Slider);
