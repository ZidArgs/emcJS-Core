// main
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/emcJS/ui/Page.js";
// form
import FormContext from "/emcJS/util/form/FormContext.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/FormFieldset.js";
import "/emcJS/ui/form/FormField.js";
import "/emcJS/ui/form/FormRow.js";
import "/emcJS/ui/form/button/SubmitButton.js";
import "/emcJS/ui/form/button/ResetButton.js";
import "/emcJS/ui/form/button/ActionButton.js";
import "/emcJS/ui/form/button/LinkButton.js";
import "/emcJS/ui/form/button/ErrorButton.js";
import "/emcJS/ui/form/input/FormInputLoader.js";

const formContext = new FormContext();
formContext.allowEnter = true;
formContext.hideErrors = true;
const formContainerEl = document.getElementById("form");
formContext.registerFormContainer(formContainerEl);

const errorButtonEl = document.getElementById("error-button");

formContext.addEventListener("submit", (event) => {
    const {errors, data, hiddenData, changes} = event;
    const valid = formContext.getFormValidity() ? "valid" : "invalid";
    console.group(`submit (${valid})`);
    console.log("[E] errors", errors);
    console.log("[E] data", data);
    console.log("[E] hiddenData", hiddenData);
    console.log("[E] changes", changes);
    console.log("formData", formContext.getInternalFormData());
    console.groupEnd(`submit (${valid})`);
    errorButtonEl.setErrors();
});

formContext.addEventListener("error", (event) => {
    const {errors} = event;
    console.group("error");
    console.log("errors", errors);
    console.log("data", formContext.getFormFieldsData());
    console.groupEnd("error");
    errorButtonEl.setErrors(errors);
});

formContext.addEventListener("validity", (event) => {
    const {valid} = event;
    if (valid) {
        errorButtonEl.removeError(event.element);
    } else {
        errorButtonEl.addError({
            name: event.name,
            label: event.element.label,
            element: event.element,
            errors: [event.message]
        });
    }
});

const actionEl = document.getElementById("action");
actionEl.setValueRenderer((value) => value ? `Entered value: ${value}` : "A whole lot of nothing");
actionEl.addEventListener("action", async () => {
    const value = await ModalDialog.prompt("enter text", "enter text to display");
    if (value) {
        actionEl.value = value;
    } else {
        actionEl.value = null;
    }
});

window.formContext = formContext;
