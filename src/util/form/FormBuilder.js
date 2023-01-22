
export default class FormBuilder {

    build(window, options) {
        for (const ref in options) {
            const option = options[ref];
            switch (option.type) {
                case "action-button": { // former "button"
                    // existing
                } break;
                case "link-button": {
                    // existing
                } break;
                case "fieldset": {
                    // existing
                } break;
                case "input": {
                    this.#buildInput(window, option, ref)
                } break;
            }
        }
    }

    #buildInput(window, option, ref) {
        const category = option.category; // deprecated
        const label = option.label || ref;
        const desc = option.desc;
        switch (option.inputType) {
            case "switch": { // former "check"
                // existing
            } break;
            case "string": {
                // existing
            } break;
            case "number": {
                // existing
            } break;
            case "range": {
                // existing
            } break;
            case "color": {
                // existing
            } break;
            case "password": {
                // existing - new
            } break;
            case "hotkey": {
                // existing
            } break;
            case "search-select": { // former "choice"
                window.addChoiceInput(category, ref, label, desc, option.default, option.visible, option.resettable, option.values);
            } break;
            case "list-select": { // former "list"
                window.addListSelectInput(category, ref, label, desc, option.default, option.visible, option.resettable, option.multiple, option.values);
            } break;
        }
    }

}
