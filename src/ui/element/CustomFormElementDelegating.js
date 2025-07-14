import CustomFormElement from "./CustomFormElement.js";

// TODO is this really needed just to add a single abstract parameter
export default class CustomFormElementDelegating extends CustomFormElement {

    constructor() {
        if (new.target === CustomFormElementDelegating) {
            throw new Error("can not construct abstract class");
        }
        super();
    }

    static get delegatesFocus() {
        return true;
    }

}
