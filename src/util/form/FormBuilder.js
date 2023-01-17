
export default class FormBuilder {

    build(window, options) {
        for (const ref in options) {
            const option = options[ref];
            switch (option.type) {
                case "action-button": {
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
        switch (option.is) {
            case "string": {
                // existing
            } break;
            case "number": {
                // existing
            } break;
            case "range": {
                // existing
            } break;
            case "check": {
                window.addCheckInput(category, ref, label, desc, option.default, option.visible, option.resettable);
            } break;
            case "color": {
                // existing
            } break;
            case "password": {
                // existing - new
            } break;
            case "hotkey": {
                window.addKeyInput(category, ref, label, desc, option.default, option.visible, option.resettable);
            } break;
            case "choice": {
                window.addChoiceInput(category, ref, label, desc, option.default, option.visible, option.resettable, option.values);
            } break;
            case "list": {
                window.addListSelectInput(category, ref, label, desc, option.default, option.visible, option.resettable, option.multiple, option.values);
            } break;
            case "button": {
                window.addButton(category, ref, label, desc, option.visible, option.text, () => {
                    const event = new Event(option.event ?? "button");
                    event.action = option.action;
                    window.dispatchEvent(event);
                });
            } break;
        }
    }

}
