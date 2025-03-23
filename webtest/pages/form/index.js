// main
import i18n from "/emcJS/util/I18n.js";
import FileLoader from "/emcJS/util/file/FileLoader.js";
import CustomActionRegistry from "/emcJS/data/registry/CustomActionRegistry.js";
import LogicOperatorRegistry from "/emcJS/data/registry/LogicOperatorRegistry.js";
import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import TokenRegistry from "/emcJS/data/registry/form/TokenRegistry.js";
import "/emcJS/ui/Page.js";
// form
import FormBuilder from "/emcJS/util/form/FormBuilder.js";
import FormContext from "/emcJS/util/form/FormContext.js";

/*
       NOW                  |    BEFORE
    "Fieldset"              | new (structural only)
    "ButtonRow"             | new (structural only)
    "SubmitButton"          | new
    "ResetButton"           | new
    "ActionButton"          | "button"
    "LinkButton"            | new
    "SwitchInput"           | "check"
    "StringInput"           | "string"
    "NumberInput"           | "number"
    "RangeInput"            | "range"
    "ColorInput"            | "color"
    "PasswordInput"         | "password"
    "HotkeyInput"           | "hotkey"
    "TextInput"             | new
    "BoolOrLogicInput"      | new
    "SearchSelect"          | "choice"
    "SimpleSelect"          | new
    "ImageSelect"           | new
    "TokenSelect"           | new
    "OptionAmountListInput" | new
    "KeyValueListInput"     | new
    "ListInput"             | new
    "RelationSelect"        | new
    "ListSelect"            | "list"

    MISSING
    "CharInput"
    "FileInput"
    "Heading-{1-6}" - predefined in formbuilder
    "Text" - predefined in formbuilder

*/

const ALLOW_INVALID = false;

i18n.setTranslation("en", {"test.desc": "this is a test"});
i18n.language = "en";

const [defaultValues, optionGroups, tokenGroups, buttonConfig, extraConfig, ...formConfig] = await Promise.all([
    FileLoader.json("./_config/defaults.json"),
    FileLoader.json("./_config/OptionGroups.json"),
    FileLoader.json("./_config/TokenGroups.json"),
    FileLoader.json("./form-config/Buttons.json"),
    FileLoader.json("./form-config/extra.json"),
    FileLoader.json("./form-config/input/ListInput.json"),
    FileLoader.json("./form-config/input/KeyValueListInput.json"),
    FileLoader.json("./form-config/input/OptionAmountListInput.json"),
    FileLoader.json("./form-config/select/TokenSelect.json"),
    FileLoader.json("./form-config/select/ImageIconSelect.json"),
    FileLoader.json("./form-config/input/BoolOrLogicInput.json"),
    FileLoader.json("./form-config/select/ListSelect.json"),
    FileLoader.json("./form-config/select/SearchSelect.json"),
    FileLoader.json("./form-config/select/SimpleSelect.json"),
    FileLoader.json("./form-config/input/TextInput.json"),
    FileLoader.json("./form-config/input/StringInput.json"),
    FileLoader.json("./form-config/input/NumberInput.json"),
    FileLoader.json("./form-config/input/RangeInput.json"),
    FileLoader.json("./form-config/input/PasswordInput.json"),
    FileLoader.json("./form-config/input/ColorInput.json"),
    FileLoader.json("./form-config/input/HotkeyInput.json"),
    FileLoader.json("./form-config/input/SwitchInput.json")
]);

OptionGroupRegistry.load(optionGroups);
TokenRegistry.load(tokenGroups);

const pageEl = document.getElementById("page");

const formContext = new FormContext(defaultValues);

const config = {
    hasHeader: true,
    hasFooter: true,
    forms: []
};

/* add buttons in seperate form */
config.forms.push({
    config: {
        values: {test: "foobar"},
        allowsInvalid: ALLOW_INVALID
    },
    elements: buttonConfig
});
config.forms.push({
    config: {
        values: {test: "foobar"},
        allowsInvalid: ALLOW_INVALID
    },
    elements: extraConfig
});

for (const elements of formConfig) {
    config.forms.push({
        config: {
            submitButton: true,
            resetButton: true,
            allowsInvalid: ALLOW_INVALID
        },
        elements
    });
}

/* add seperate submit */
config.forms.push({
    config: {
        submitButton: true,
        resetButton: true,
        allowsInvalid: ALLOW_INVALID
    }
});

const formContainerEl = FormBuilder.build(config);
formContext.registerFormContainer(formContainerEl);
pageEl.append(formContainerEl);

const stringRequiredFields = formContext.findFieldsByName("string.required");
for (const stringRequiredField of stringRequiredFields) {
    stringRequiredField.addValidator((value) => {
        if (value == null) {
            return "This is a custom error shown if the field is not set";
        } else if (value === "") {
            return "This is a custom error shown if the field is empty";
        }
    });
}
formContext.addValidator((data) => {
    for (const name in data) {
        const value = data[name];
        if (value == null) {
            const errorFields = formContext.findFieldsByName(name);
            for (const errorField of errorFields) {
                errorField.addError("This is a global custom error shown if the field is not set");
            }
        } else if (value === "" || (typeof value === "number" && isNaN(value))) {
            const errorFields = formContext.findFieldsByName(name);
            for (const errorField of errorFields) {
                errorField.addError("This is a global custom error shown if the field is empty");
            }
        } else if (value === "0" || value === 0) {
            const errorFields = formContext.findFieldsByName(name);
            for (const errorField of errorFields) {
                errorField.addError("This is a global custom error shown if the value is 0");
            }
        }
    }
});

console.group("init context");
console.log("loaded data", defaultValues);
console.log("changed data", formContext.getChanges());
console.groupEnd("init context");

formContext.addEventListener("submit", (event) => {
    const {
        errors, changes, data, formData, hiddenData
    } = event;
    const valid = formContext.getFormValidity() ? "valid" : "invalid";
    console.group(`submit (${valid})`);
    console.log("errors", errors);
    console.log("changed data", changes);
    console.log("all data", data);
    console.log("form data", formData);
    console.log("hidden form data", hiddenData);
    console.groupEnd(`submit (${valid})`);
});

formContext.addEventListener("error", (event) => {
    const {errors} = event;
    console.group("error");
    console.log("errors", errors);
    console.groupEnd("error");
});

CustomActionRegistry.current.set("soup", () => {
    alert("only soup");
});

CustomActionRegistry.current.set("cheese", () => {
    alert("more cheese");
    formContext.loadData({
        "search-select": {"required": "foobar"},
        "text": {"required": "nice"},
        "number": {"required": 69},
        "password": {"required": "password"},
        "color": {
            "default": "#ff0000",
            "resettable": "#00ff00",
            "required": "#0000ff"
        },
        "hotkey": {
            "default": "ctrl w",
            "resettable": "ctrl a",
            "required": "ctrl s",
            "readonly": "ctrl d"
        },
        "switch": {"required": true}
    }, true);
});

const logicTestEl = document.getElementById("logicTest");
logicTestEl.addOperatorGroup("custom-settings");
LogicOperatorRegistry.setGroupCaption("custom-settings", "custom settings");

LogicOperatorRegistry.setOperator("value.test", {"type": "value"});
LogicOperatorRegistry.linkOperator("value.test", "custom-settings");

LogicOperatorRegistry.setOperator("state.test", {
    "type": "state",
    "options": {
        "test": "Test",
        "foobar": "Foobar",
        "barfoo": "Barfoo"
    },
    "value": "test"
});
LogicOperatorRegistry.linkOperator("state.test", "custom-settings");
