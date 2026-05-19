import {getFromObjectByPath} from "@emcjs/core/util/helper/collection/ObjectContent.js";
import EntityState from "./EntityState.js";
import  {immute} from "../../Immutable.js";

export default class EntityStateManager {

    #propData;

    #defaultStateClass;

    #entityStateClasses = new Map();

    #entityStateInstances = new Map();

    constructor(DefaultStateClass = EntityState, props = {}) {
        if (!(DefaultStateClass.prototype instanceof EntityState)) {
            throw new TypeError("DefaultStateClass must extend EntityState");
        }
        /* --- */
        this.#defaultStateClass = DefaultStateClass;
        this.#propData = immute(props);
    }

    setDefaultStateClass(StateClass) {
        if (!(StateClass.prototype instanceof EntityState)) {
            throw new TypeError("StateClass must extend EntityState");
        }
        this.#defaultStateClass = StateClass;
    }

    registerStateClass(type, StateClass) {
        if (!(StateClass.prototype instanceof EntityState)) {
            throw new TypeError("StateClass must extend EntityState");
        }
        this.#entityStateClasses.set(type, StateClass);
    }

    getStateClass(type) {
        if (this.#entityStateClasses.has(type)) {
            return this.#entityStateClasses.get(type);
        }
        return this.#defaultStateClass;
    }

    has(ref) {
        return this.#propData[ref] != null;
    }

    get(ref) {
        if (typeof ref !== "string") {
            console.warn(`tried to get state with non string ref "${ref}" (${typeof ref}) from "${this.constructor.name}"`);
            return;
        }
        if (ref === "") {
            console.warn(`tried to get state with empty ref from "${this.constructor.name}"`);
            return;
        }
        if (this.#entityStateInstances.has(ref)) {
            return this.#entityStateInstances.get(ref);
        }
        const props = getFromObjectByPath(this.#propData, ref.split("/"));
        if (props != null) {
            const StateClass = this.getStateClass(props.type);
            const state = new StateClass(ref, props);
            this.initState(state);
            this.#entityStateInstances.set(ref, state);
            return state;
        } else {
            console.warn(`tried to get state with unknown ref "${ref}" from "${this.constructor.name}"`);
        }
    }

    initState(/* state */) {
        // empty
    }

    getAll() {
        const res = {};
        for (const [key, value] of this.#entityStateInstances) {
            res[key] = value;
        }
        return res;
    }

    [Symbol.iterator]() {
        const keys = Object.keys(this.#propData);
        let index = 0;
        return {
            next: () => {
                if (index < keys.length) {
                    const key = keys[index++];
                    return {
                        value: [key, this.get(key)],
                        done: false
                    };
                } else {
                    return {done: true};
                }
            }
        };
    }

}
