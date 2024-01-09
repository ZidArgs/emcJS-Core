import ElementManager from "../../../../../../util/html/ElementManager.js";

export default class TokenSelectedElementManager extends ElementManager {

    composer(key, params) {
        const el = document.createElement("emc-i18n-label");
        el.className = "token";
        el.i18nValue = params.content ?? key;
        el.dataset.value = key;
        el.addEventListener("click", (event) => {
            params.tokenAction(event);
        });
        return el;
    }

}
