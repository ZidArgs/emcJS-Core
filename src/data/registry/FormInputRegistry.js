import FormInput from "../../ui/form/field/FormInput.js";
import ClassRegistry from "./ClassRegistry.js";

class FormInputRegistry extends ClassRegistry {

    register(ref, RegClass) {
        if (!(RegClass.prototype instanceof FormInput)) {
            throw new TypeError("registered field types must inherit from FormInput");
        }
        return super.register(ref, RegClass);
    }

}

export default new FormInputRegistry();
