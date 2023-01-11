
export default class FormBuilder {

    build(window, options) {
        for (const ref in options) {
            const option = options[ref];
            const category = option.category;
            const label = option.label || ref;
            const desc = option.desc;
            switch (option.type) {
                case "string": {
                    // existing
                } break;
                case "number": {
                    // existing
                } break;
                case "range": {
                    const min = parseFloat(option.min);
                    const max = parseFloat(option.max);
                    window.addRangeInput(category, ref, label, desc, option.default, option.visible, option.resettable, min, max);
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

}
