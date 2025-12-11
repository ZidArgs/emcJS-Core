import EventManager from "../../../../../../util/event/EventManager.js";
import ElementManager from "../../../../../../util/html/ElementManager.js";
import "../../../../../i18n/I18nLabel.js";

export default class TokenSelectedElementManager extends ElementManager {

    #eventManager = new EventManager(false);

    setEventManagerActive(value) {
        this.#eventManager.active = value;
    }

    composer(key, values) {
        const el = document.createElement("emc-i18n-label");
        el.className = "token";
        el.i18nValue = values.label ?? key;
        el.dataset.value = key;
        this.#eventManager.set(el, "click", (event) => {
            values.tokenAction(event);
        });
        return el;
    }

    mutator(el, key, values) {
        el.i18nValue = values.label ?? key;
    }

    cleanup(el) {
        this.#eventManager.clear(el);
    }

}
