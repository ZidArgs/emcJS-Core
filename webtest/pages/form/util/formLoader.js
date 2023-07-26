// main
import i18n from "/emcJS/util/I18n.js";
import FileLoader from "/emcJS/util/file/FileLoader.js";
import OptionGroupRegistry from "/emcJS/data/registry/OptionGroupRegistry.js";
import TokenRegistry from "/emcJS/data/registry/TokenRegistry.js";
import "/emcJS/ui/Page.js";
// form
import FormBuilder from "/emcJS/util/form/FormBuilder.js";
import FormContext from "/emcJS/util/form/FormContext.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/FormFieldset.js";
import "/emcJS/ui/form/FormRow.js";
import "/emcJS/ui/form/button/SubmitButton.js";
import "/emcJS/ui/form/button/ResetButton.js";
import "/emcJS/ui/form/button/ActionButton.js";
import "/emcJS/ui/form/button/LinkButton.js";
import "/emcJS/ui/form/field/DefaultFormFieldsLoader.js";

let initFlag = false;

export async function init() {
    if (initFlag) {
        return;
    }
    i18n.language = "en";
    const [optionGroups, tokenGroups] = await Promise.all([
        FileLoader.json("/pages/form/_config/OptionGroups.json"),
        FileLoader.json("/pages/form/_config/TokenGroups.json")
    ]);
    OptionGroupRegistry.load(optionGroups);
    TokenRegistry.load(tokenGroups);
    initFlag = true;
}

export async function loadForm(allowsInvalid) {
    const [defaultValues, formElements] = await Promise.all([
        FileLoader.json("/pages/form/_config/defaults.json"),
        FileLoader.json(`./config.json`)
    ]);

    const pageEl = document.getElementById("page");
    const formContext = new FormContext(defaultValues);

    const formConfig = {
        hasHeader: false,
        hasFooter: true,
        forms: []
    };

    // --- fill the forms
    if (Array.isArray(formElements)) {
        for (const formEls of formElements) {
            formConfig.forms.push({
                config: {
                    allowsInvalid
                },
                elements: formEls
            });
        }
    } else {
        formConfig.forms.push({
            config: {
                allowsInvalid
            },
            elements: formElements
        });
    }

    formConfig.forms.push({
        config: {
            submitButton: true,
            resetButton: true,
            allowsInvalid,
            values: {
                test: "foobar"
            }
        }
    });
    // ---

    const formContainerEl = FormBuilder.build(formConfig);
    formContext.registerFormContainer(formContainerEl);
    pageEl.append(formContainerEl);

    console.group("init context");
    console.log("loaded data", defaultValues);
    console.log("changed data", formContext.getChanges());
    console.groupEnd("init context");

    formContext.addEventListener("submit", (event) => {
        const {errors, changes, data, formData, hiddenData} = event;
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

    return formContext;
}
