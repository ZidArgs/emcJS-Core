import CustomFormElement from "../../ui/element/CustomFormElement.js";
import CustomFormElementDelegating from "../../ui/element/CustomFormElementDelegating.js";
import Helper from "../../util/helper/Helper.js";
import ClassRegistry from "./ClassRegistry.js";

const EXPECTED_CLASSES = [
    HTMLInputElement,
    HTMLButtonElement,
    CustomFormElement,
    CustomFormElementDelegating
];

class FormElementRegistry extends ClassRegistry {

    register(ref, RegClass) {
        if (!Helper.instanceOfOne(RegClass.prototype, ...EXPECTED_CLASSES)) {
            throw new TypeError(`registered types must inherit from one of [${EXPECTED_CLASSES.map((c) => c.name).join(", ")}]`);
        }
        return super.register(ref, RegClass);
    }

}

export default new FormElementRegistry();
