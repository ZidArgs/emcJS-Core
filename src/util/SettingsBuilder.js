class SettingsBuilder {

    build(window, options) {
        for (const key in options) {
            const option = options[key];
            const category = option.category;
            switch (option.type) {
                case "string": {
                    window.addStringInput(category, key, key, option.default, option.visible, option.resettable);
                } break;
                case "number": {
                    const min = parseFloat(option.min);
                    const max = parseFloat(option.max);
                    window.addNumberInput(category, key, key, option.default, option.visible, option.resettable, min, max);
                } break;
                case "range": {
                    const min = parseFloat(option.min);
                    const max = parseFloat(option.max);
                    window.addRangeInput(category, key, key, option.default, option.visible, option.resettable, min, max);
                } break;
                case "check": {
                    window.addCheckInput(category, key, key, option.default, option.visible, option.resettable);
                } break;
                case "color": {
                    window.addColorInput(category, key, key, option.default, option.visible, option.resettable);
                } break;
                case "choice": {
                    window.addChoiceInput(category, key, key, option.default, option.visible, option.resettable, option.values);
                } break;
                case "list": {
                    window.addListSelectInput(category, key, key, option.default, option.visible, option.resettable, option.multiple, option.values);
                } break;
                case "button": {
                    window.addButton(category, key, key, option.visible, option.text, () => {
                        const event = new Event(option.event ?? "button");
                        event.action = option.action;
                        window.dispatchEvent(event);
                    });
                } break;
            }
        }
    }

}

export default new SettingsBuilder();
