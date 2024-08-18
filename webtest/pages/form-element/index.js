// main
import FormElementRegistry from "/emcJS/data/registry/form/FormElementRegistry.js";
import FormBuilder from "/emcJS/util/form/FormBuilder.js";
import {
    extractDefaultValuesFromConfig
} from "/emcJS/util/helper/ui/Form.js";
import Modal from "/emcJS/ui/modal/Modal.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/container/CaptionPanel.js";
// form
import FormContext from "/emcJS/util/form/FormContext.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/FormFieldset.js";
import "/emcJS/ui/form/FormField.js";
import "/emcJS/ui/form/FormRow.js";
import "/emcJS/ui/form/button/Button.js";
import "/emcJS/ui/form/button/SubmitButton.js";
import "/emcJS/ui/form/button/ResetButton.js";
import "/emcJS/ui/form/button/ActionButton.js";
import "/emcJS/ui/form/button/LinkButton.js";
import "/emcJS/ui/form/button/ErrorButton.js";
import "/emcJS/ui/form/element/FormElementsLoader.js";
import I18nOption from "../../emcJS/ui/i18n/builtin/I18nOption.js";
import {
    debounce
} from "../../emcJS/util/Debouncer.js";

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

function getDetailConfig(ref) {
    if (ref) {
        const clazz = FormElementRegistry.getRegisteredClass(ref);
        if (clazz != null) {
            return clazz.formConfigurationFields;
        }
    }
    return [];
}

const elementTypeSelectEl = document.getElementById("type-select");
loadElementTypes(elementTypeSelectEl);

elementTypeSelectEl.addEventListener("change", () => {
    const type = elementTypeSelectEl.value;
    const oldDetailFormEl = document.getElementById("detail-form");

    if (type != null && type !== "") {
        const config = getDetailConfig(type);
        const defaults = extractDefaultValuesFromConfig(config);

        FormBuilder.replaceForm(oldDetailFormEl, config);
        formContext.loadData({...defaults, type});
    } else {
        FormBuilder.replaceForm(oldDetailFormEl);
        formContext.loadData({});
    }
});

function buildPreview(config) {
    const oldPreviewEl = document.getElementById("preview-element");
    const formElementEl = FormBuilder.replaceFormComponent(oldPreviewEl, {...config, id: "preview-element"});

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
                "content": [
                    {
                        "type": "true"
                    },
                    {
                        "type": "false"
                    }
                ]
            };
        } break;
    }
}

// TODO add show JSON
const showHTMLButtonEl = document.getElementById("show-html");
showHTMLButtonEl.addEventListener("click", () => {
    const valid = formContext.getFormValidity();
    if (valid) {
        const modalEl = new Modal();
        modalEl.caption = "Show HTML";
        modalEl.shadowRoot.getElementById("modal").style.width = "100%";
        const codeEl = document.createElement("emc-input-code");
        codeEl.readonly = true;
        codeEl.noHover = true;
        /* --- */
        const data = formContext.getFormFieldsData();
        const previewEl = document.getElementById("preview-element");
        const tagName = previewEl.tagName.toLowerCase();
        const attributes = [];
        const content = [];
        for (const [name, value] of Object.entries(data)) {
            if (value != null && name !== "type") {
                if (name === "options") {
                    for (const [key, val] of Object.entries(value)) {
                        content.push(`<option is="emc-i18n-option" value="${key}" i18n-value="${val}"></option>`);
                    }
                } else if (name === "columns") {
                    for (const column of value) {
                        const {key = "", type = "string", caption = "", width, editable = false} = column;

                        const columnWidth = parseInt(width);
                        const widthDef = !isNaN(columnWidth) ? ` width="${columnWidth}"` : "";

                        const editableDef = editable ? ` editable` : "";

                        content.push(`<emc-datagrid-column name="${key}" type="${type}" caption="${caption}"${widthDef}${editableDef}></emc-datagrid-column>`);
                    }
                } else if (typeof value === "boolean") {
                    if (value) {
                        attributes.push(`${name}`);
                    }
                } else if (name === "sorted") {
                    if (value === "manual") {
                        attributes.push(`sorted="manual"`);
                    } else if (value && value !== "false") {
                        attributes.push(`sorted`);
                    }
                } else if (typeof value === "object") {
                    attributes.push(`${name}="${JSON.stringify(value)}"`);
                } else if (value !== "") {
                    attributes.push(`${name}="${value}"`);
                }
            }
        }
        const attributesString = attributes.length > 0 ? `\n${attributes.map((a) => `    ${a}`).join("\n")}\n` : "";
        const contentString = content.length > 0 ? `\n${content.map((c) => `    ${c}`).join("\n")}\n` : "";
        codeEl.value = `<${tagName}${attributesString}>${contentString}</${tagName}>`;
        /* --- */
        modalEl.append(codeEl);
        modalEl.show();
    } else {
        ModalDialog.alert("Configuration invalid", "Your configuration is not valid.\nPlease fix your configuration and try again!");
    }
});
