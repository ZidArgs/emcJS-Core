import AbstractType from "./AbstractType.js";

export default class TypeString extends AbstractType {

    static format(value) {
        switch (typeof value) {
            case "string":
                return value;
            case "number":
            case "boolean":
            case "function":
                return value.toString();
            case "object":
                if (value instanceof HTMLElement) {
                    return value.toString();
                } else {
                    return JSON.stringify(value);
                }
            default:
                return "";
        }
    }

}
