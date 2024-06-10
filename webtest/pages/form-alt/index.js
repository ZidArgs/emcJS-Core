// main
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
import "/emcJS/ui/form/element/input/string/StringInput.js";

const formContext = new FormContext();
const formContainerEl = document.getElementById("form");
formContext.registerFormContainer(formContainerEl);

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
});

formContext.addEventListener("error", (event) => {
    const {errors} = event;
    console.group("error");
    console.log("errors", errors);
    console.groupEnd("error");
});
