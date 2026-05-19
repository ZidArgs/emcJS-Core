import {isDict} from "../../../util/helper/CheckType.js";
import WeakInstanceMap from "../../collection/WeakInstanceMap.js";
import  {immute} from "../../Immutable.js";

const VALID_NAME = /[a-zA-Z0-9_./-]+/;

const INSTANCES = new WeakInstanceMap();

export default class EntityState extends EventTarget {

    #type;

    #ref;

    #props = {};

    constructor(ref, props = {}) {
        if (typeof ref != "string") {
            throw new TypeError(`ref must be a "string" but was "${typeof ref}"`);
        }
        if (!ref) {
            throw new Error("ref must not be empty");
        }
        if (!VALID_NAME.test(ref)) {
            throw new Error("ref can only include the following characters [a-zA-Z0-9_./-]");
        }
        if (!isDict(props)) {
            throw new Error("props must be a dict");
        }
        const type = new.target.name;
        const instance = INSTANCES.get(type, ref);
        if (instance != null) {
            return instance;
        }
        super();
        INSTANCES.set(type, ref, this);
        /* --- */
        this.#type = type;
        this.#ref = ref;
        this.#props = immute(props);
    }

    get ref() {
        return this.#ref;
    }

    get props() {
        return this.#props;
    }

    serialize() {
        return {
            type: this.#type,
            ref: this.#ref
        };
    }

    deserialize() {
        // empty
    }

    static getState(type, ref) {
        return INSTANCES.get(type, ref);
    }

}
