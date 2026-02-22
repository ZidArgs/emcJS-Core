// main
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import SectionTreeManager from "/emcJS/util/form/manager/SectionTreeManager.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/tree/Tree.js";
// form
import OptionGroupRegistryChoiceManager from "/emcJS/util/form/manager/OptionGroupRegistryChoiceManager.js";
import FormContext from "/emcJS/util/form/FormContext.js";
import FormErrorButtonManager from "/emcJS/util/form/manager/FormErrorButtonManager.js";
import "/emcJS/ui/form/FormContainer.js";
import "/emcJS/ui/form/FormComponentsLoader.js";
import {init} from "../form/util/formLoader.js";

await init();

const formContext = new FormContext();
formContext.allowEnter = true;
formContext.hideErrors = true;
const formContainerEl = document.getElementById("form");
formContext.registerFormContainer(formContainerEl);

const sectionTreeManager = new SectionTreeManager();
const formSectionNavigationEl = document.getElementById("form-section-navigation");
sectionTreeManager.setFormSectionNavigationElement(formSectionNavigationEl);
sectionTreeManager.observe(formContainerEl);

const errorButtonEl = document.getElementById("error-button");
new FormErrorButtonManager(errorButtonEl, formContext);

formContext.addEventListener("submit", (event) => {
    const {
        errors, data, hiddenData, changes
    } = event;
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
    console.log("data", formContext.getFormFieldsData());
    console.groupEnd("error");
});

const actionEl = document.getElementById("action");
actionEl.setValueRenderer((value) => value ? `Entered value: ${value}` : "");
actionEl.addEventListener("action", async () => {
    const value = await ModalDialog.prompt("enter text", "enter text to display");
    if (value) {
        actionEl.value = value;
    } else {
        actionEl.value = null;
    }
});

const imageSelectEl = document.getElementById("image-select");
const manager = new OptionGroupRegistryChoiceManager(imageSelectEl);
manager.optionGroup = "ImageSelect";

window.formContext = formContext;
