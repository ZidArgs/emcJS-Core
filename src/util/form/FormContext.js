import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import FormContainer from "../../ui/form/FormContainer.js";
import EventMultiTargetManager from "../event/EventMultiTargetManager.js";
import EventTargetManager from "../event/EventTargetManager.js";

// TODO set all values for newly registered forms

export default class FormContext {

    #dataStorage = new ObservableStorage();

    #formListEventManager = new EventMultiTargetManager();

    #storageEventTargetManager = new EventTargetManager();

    #formElList = new Set();

    constructor(initValues = {}) {
        this.#formListEventManager.set("value", (event) => {
            const {name, value} = event;
            this.#dataStorage.set(name, value);
        });
        this.#formListEventManager.set("default", (event) => {
            const {name, value} = event;
            this.#dataStorage.set(name, value);
        });
        /* --- */
        this.#dataStorage.deserialize(initValues);
        this.#storageEventTargetManager.switchTarget(this.#dataStorage);
        this.#storageEventTargetManager.set("clear", () => {
            this.#formListEventManager.setActive(false);
            for (const formEl of this.#formElList) {
                formEl.reset();
            }
            this.#formListEventManager.setActive(true);
        });
        this.#storageEventTargetManager.set(["load", "change"], (event) => {
            this.#formListEventManager.setActive(false);
            const {data} = event;
            for (const name in data) {
                const value = data[name];
                for (const formEl of this.#formElList) {
                    const elementList = formEl.querySelectorAll(`[name="${name}"]`);
                    for (const element of elementList) {
                        element.value = value;
                    }
                }
            }
            this.#formListEventManager.setActive(true);
        });
    }

    registerForm(formEl) {
        if (!(formEl instanceof FormContainer)) {
            throw new TypeError("FormContainer expected");
        }
        this.#formElList.add(formEl);
        this.#formListEventManager.addTarget(formEl);
    }

    unregisterForm(formEl) {
        if (!(formEl instanceof FormContainer)) {
            throw new TypeError("FormContainer expected");
        }
        this.#formElList.delete(formEl);
        this.#formListEventManager.removeTarget(formEl);
    }

    loadData(data) {
        this.#formListEventManager.setActive(false);
        this.#dataStorage.deserialize(data);
        this.#formListEventManager.setActive(true);
    }

    getChanges() {
        return this.#dataStorage.getChanges();
    }

    // #setVisibility(visible) {
    //     if (visible != null) {
    //         const logicHandler = new LogicHandler(storage, visible);
    //         logicHandler.addEventListener("change", (event) => {
    //             optionEl.style.display = event.value ? "" : "none";
    //         });
    //         if (!logicHandler.value) {
    //             optionEl.style.display = "none";
    //         }
    //     }
    // }

    // XXX is this needeed?
    // prepareForm(formEl) {
    //     this.#rootData.setAll(FormContext.#getFormData(formEl));
    //     /* --- */
    //     const observer = new MutationObserver((mutationsList) => {
    //         for (const mutation of mutationsList) {
    //             if (mutation.type == "attributes") {
    //                 const target = mutation.target;
    //                 this.#rootData.set(target.name, target.value);
    //             } else if (mutation.type == "childList") {
    //                 for (const element of mutation.addedNodes) {
    //                     this.#rootData.set(element.name, element.value);
    //                 }
    //             }
    //         }
    //     });
    //     observer.observe(formEl, {
    //         childList: true,
    //         subtree: true,
    //         attributes: true,
    //         attributeFilter: ["value"]
    //     });
    // }

    // static #getFormData(formEl) {
    //     const result = {};
    //     const data = formEl.getData();
    //     for (const name in data) {
    //         const element = formEl.querySelector(`[name="${name}"]`);
    //         result[name] =  element.value;
    //     }
    //     return result;
    // }

}
