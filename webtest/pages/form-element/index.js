// main
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import FormBuilder, {getFormConfig} from "/emcJS/util/form/FormBuilder.js";
import {extractDefaultValuesFromConfig} from "/emcJS/util/helper/ui/Form.js";
import {debounce} from "/emcJS/util/Debouncer.js";
import ModalDialogCodeInput from "/emcJS/ui/modal/input/ModalDialogCodeInput.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import I18nOption from "/emcJS/ui/i18n/builtin/I18nOption.js";
import Column from "/emcJS/ui/dataview/datagrid/Column.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/container/CaptionPanel.js";
// form
import FormContext from "/emcJS/util/form/FormContext.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/FormComponentsLoader.js";

const formContext = new FormContext();
formContext.allowEnter = false;
const formContainerEl = document.getElementById("form");
formContext.registerFormContainer(formContainerEl);

formContext.addEventListener("change", debounce(() => {
    const data = formContext.getFormFieldsData();
    const valid = formContext.getFormValidity();
    if (valid) {
        buildPreview(data);
    }
    console.log("data", data);
}));

function loadElementTypes(elementTypeSelectEl) {
    if (elementTypeSelectEl != null) {
        const formElementTypes = FormElementRegistry.getRegisteredRefs();
        for (const ref of formElementTypes) {
            const optionEl = I18nOption.create(ref, ref);
            elementTypeSelectEl.append(optionEl);
        }
    }
}

const elementTypeSelectEl = document.getElementById("type-select");
loadElementTypes(elementTypeSelectEl);

elementTypeSelectEl.addEventListener("change", () => {
    const type = elementTypeSelectEl.value;
    const oldDetailFormEl = document.getElementById("detail-form");

    if (type != null && type !== "") {
        const config = getFormConfig(type);
        const defaults = extractDefaultValuesFromConfig(config);

        FormBuilder.replaceForm(oldDetailFormEl, config);

        const data = {
            ...defaults,
            type
        };
        formContext.setData(data);
        // buildPreview(data);
    } else {
        FormBuilder.replaceForm(oldDetailFormEl);
        formContext.setData({});
    }
});

function buildPreview(config) {
    const oldPreviewEl = document.getElementById("preview-element");
    const formFieldEl = FormBuilder.replaceFormComponent(oldPreviewEl, config);
    formFieldEl.id = "preview-element";

    // setTimeout(() => {
    const formElementEl = formFieldEl.assignedElement;

    switch (config.type) {
        case "ActionInput": {
            formElementEl.setValueRenderer((value) => value ? `Entered value: ${value}` : "");
            formElementEl.addEventListener("action", async () => {
                const value = await ModalDialog.prompt("enter text", "enter text to display");
                if (value) {
                    formElementEl.value = value;
                } else {
                    formElementEl.value = null;
                }
            });
        } break;
        case "LogicInput":
        case "BoolOrLogicInput": {
            formElementEl.defaultValue = {
                "type": "and",
                "content": [{"type": "true"}, {"type": "false"}]
            };
        } break;
        case "GridSelect": {
            // TODO this should be done in some manager so it can be reused in form editors, etc.
            const gridDataEl = formContext.findFieldsByName("options")[0];
            gridDataEl.innerHTML = "";
            for (const column of config.columns) {
                const columnEl = new Column();
                const {key = ""} = column;
                columnEl.name = key;
                if (key === "key") {
                    const {
                        caption = "", width = 0
                    } = column;
                    columnEl.type = "string";
                    columnEl.caption = caption;
                    columnEl.width = width;
                    columnEl.editable = false;
                } else {
                    const {
                        type = "string", caption = "", width = 0
                    } = column;
                    columnEl.type = type;
                    columnEl.caption = caption;
                    columnEl.width = width;
                    columnEl.editable = true;
                }
                gridDataEl.append(columnEl);
            }
        } break;
    }
    // }, 0);
}

// TODO add show JSON
const showHTMLButtonEl = document.getElementById("show-html");
showHTMLButtonEl.addEventListener("click", () => {
    const valid = formContext.getFormValidity();
    if (valid) {
        const data = formContext.getFormFieldsData();
        if (data.type != null) {
            const config = {};
            for (const [key, value] of Object.entries(data)) {
                if ([
                    "visible",
                    "editable",
                    "enabled"
                ].includes(key) && value === true) {
                    continue;
                } else if (value == null || value === false || value === "" || (Array.isArray(value) && !value.length)) {
                    continue;
                }
                config[key] = value;
            }
            const fromComponentEl = FormBuilder.createFormComponent(config);
            const value = stringifyHTMLElement(fromComponentEl);
            /* --- */
            const modalEl = new ModalDialogCodeInput();
            modalEl.streched = ModalDialogCodeInput.AXES.BOTH;
            modalEl.resize = ModalDialogCodeInput.AXES.BOTH;
            modalEl.caption = "Show HTML";
            modalEl.readOnly = true;
            modalEl.show(value);
        } else {
            ModalDialog.alert("No element type selected", "Please select the element type!");
        }
    } else {
        ModalDialog.alert("Configuration invalid", "Your configuration is not valid.\nPlease fix your configuration and try again!");
    }
});

function stringifyHTMLElement(el) {
    const tagName = el.tagName.toLowerCase();
    const isName = customElements.getName(el.constructor);
    const attributes = [];
    const children = [];

    const customBuiltIn = isName != tagName;

    if (customBuiltIn) {
        attributes.push(`is="${isName}"`);
    }

    for (let i = 0; i < el.attributes.length; i++) {
        const attribute = el.attributes[i];
        const {
            name, value
        } = attribute;
        if (customBuiltIn && el.constructor.overwrittenAttributes?.includes(name)) {
            continue;
        }
        if (value === "") {
            attributes.push(name);
        } else {
            attributes.push(`${name}="${value}"`);
        }
    }

    for (const childEl of el.children) {
        children.push(stringifyHTMLElement(childEl));
    }

    const attributesString = attributes.length > 0 ? `\n${attributes.map((a) => indent(a)).join("\n")}\n` : "";
    const contentString = children.length > 0 ? `\n${children.map((c) => indent(c)).join("\n")}\n` : "";
    return `<${tagName}${attributesString}>${contentString}</${tagName}>`;
}

function indent(string) {
    return string.split("\n").map((s) => `    ${s}`).join("\n");
}
