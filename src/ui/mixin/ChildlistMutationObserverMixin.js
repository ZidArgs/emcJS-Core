import {
    createMixin
} from "../../util/Mixin.js";

export default createMixin((superclass) => class ChildlistMutationObserverMixin extends superclass {

    constructor() {
        super();
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type == "childList") {
                    for (const element of mutation.addedNodes) {
                        this.nodeAddedCallback(element, mutation.target);
                    }
                    for (const element of mutation.removedNodes) {
                        this.nodeRemovedCallback(element, mutation.target);
                    }
                }
            }
        });
        observer.observe(this, {
            childList: true,
            subtree: this.constructor.checkSubtreeMutation
        });
    }

    nodeAddedCallback(element, target) {
        // nothing
    }

    nodeRemovedCallback(element, target) {
        // nothing
    }

    static get checkSubtreeMutation() {
        return false;
    }

});
