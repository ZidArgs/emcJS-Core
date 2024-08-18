
import ElementManager from "../../../../../../util/html/ElementManager.js";
import ImageSelectPreview from "./ImageSelectPreview.js";

export default class ImageSelectPreviewManager extends ElementManager {

    composer(key, values) {
        const el = ImageSelectPreview.create(key, values.label ?? key);
        return el;
    }

    mutator(el, key, values) {
        el.label = values.label ?? key;
    }

}
