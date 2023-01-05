import FormField from "../../ui/form/field/FormField.js";
import ClassRegistry from "./ClassRegistry.js";

class FormFieldRegistry extends ClassRegistry {

    register(ref, RegClass) {
        if (!(RegClass.prototype instanceof FormField)) {
            throw new TypeError("registered field types must inherit from FormField");
        }
        return super.register(ref, RegClass);
    }

}

export default new FormFieldRegistry();
