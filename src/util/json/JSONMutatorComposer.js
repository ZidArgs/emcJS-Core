import {
    isFunction, isNull
} from "../helper/CheckType.js";

export default class JSONMutatorComposer {

    #mutator;

    /**
     * Creates a new JSONMutatorComposer to join functions for the replacer/reviver function of JSON stringify/parse.
     *
     * @param {function | function[] | JSONMutatorComposer} mutator the initial mutator for the new Composer
     */
    constructor(mutator) {
        this.add(mutator);
    }

    /**
     * The resulting replacer/reviver.
     */
    get mutator() {
        return this.#mutator;
    }

    /**
     * Add mutation function(s) to the composer.
     *
     * @param {function | function[] | JSONMutatorComposer} mutator the added mutator for the Composer
     * @returns {JSONMutatorComposer} the current instance
     */
    add(mutator) {
        if (isFunction(mutator)) {
            this.#addMutator(mutator);
        } else if (Array.isArray(mutator)) {
            for (const rev of mutator) {
                this.add(rev);
            }
        } else if (mutator instanceof JSONMutatorComposer) {
            this.add(mutator.mutator);
        }
        return this;
    }

    #addMutator(newMutator) {
        const oldMutator = this.#mutator;
        if (!oldMutator) {
            this.#mutator = newMutator;
        } else {
            this.#mutator = (key, value) => {
                value = oldMutator(key, value);
                return isNull(value) ? value : newMutator(key, value);
            };
        }
    }

}
