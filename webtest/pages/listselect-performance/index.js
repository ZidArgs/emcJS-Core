import FileLoader from "/emcJS/util/file/FileLoader.js";
import I18nOption from "/emcJS/ui/i18n/builtin/I18nOption.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/form/FormComponentsLoader.js";
import "/emcJS/ui/input/ListSelect.js";
import "/emcJS/ui/input/Option.js";

const data = await FileLoader.json(`./config.json`);

const newListSelect = document.getElementById("list-select");
const oldListSelect = document.getElementById("list-select-old");

for (const key in data) {
    const value = data[key];

    {// new list select
        const optionEl = I18nOption.create();
        optionEl.value = key;
        optionEl.i18nValue = value;
        newListSelect.append(optionEl);
    }

    {// old list select
        const optionEl = document.createElement("emc-option");
        optionEl.value = key;
        const el = document.createElement("emc-i18n-label");
        el.i18nValue = value;
        optionEl.append(el);
        oldListSelect.append(optionEl);
    }
}
