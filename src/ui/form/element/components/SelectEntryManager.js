import ElementManager from "../../../../util/html/ElementManager.js";
import SelectEntry from "./SelectEntry.js";

export default class SelectEntryManager extends ElementManager {

    composer(key, values, selectEventManager) {
        const el = SelectEntry.create(key, values.label ?? key);
        selectEventManager.addTarget(el);
        return el;
    }

    mutator(el, key, values) {
        el.label = values.label ?? key;
    }

    cleanup(el, key, selectEventManager) {
        selectEventManager.removeTarget(el);
    }

}
