import AbstractFormElement from "../../ui/form/AbstractFormElement.js";
import ClassRegistry from "./ClassRegistry.js";

class FormElementRegistry extends ClassRegistry {

    register(ref, RegClass) {
        if (!(RegClass.prototype instanceof AbstractFormElement)) {
            throw new TypeError("registered types must inherit from AbstractFormElement");
        }
        return super.register(ref, RegClass);
    }

}

export default new FormElementRegistry();
