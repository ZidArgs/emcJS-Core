import {
    debounceByType
} from "../../util/Debouncer.js";
import {
    isEqual
} from "../../util/helper/Comparator.js";

class LogicOperatorRegistry extends EventTarget {

    #operators = new Map();

    #captions = new Map();

    setOperator(group, ref, config) {
        if (!(typeof group === "string") || group === "") {
            throw new TypeError("group name must be a non empty string");
        }
        const operatorGroup = this.#getOperatorGroup(group);
        const oldValue = operatorGroup.get(ref);
        if (!isEqual(oldValue, config)) {
            operatorGroup.set(ref, config);
            this.#notifyChange(group);
        }
    }

    deleteOperator(group, ref) {
        if (this.#operators.has(group)) {
            const operatorGroup = this.#operators.get(group);
            if (operatorGroup.get(ref) != null) {
                operatorGroup.delete(ref);
                this.#notifyChange(group);
            }
        }
    }

    clearGroup(group) {
        if (this.#operators.has(group)) {
            const operatorGroup = this.#operators.get(group);
            operatorGroup.clear();
            this.#notifyChange(group);
        }
    }

    get(group) {
        if (this.#operators.has(group)) {
            const operatorGroup = this.#operators.get(group);
            const res = [];
            for (const [ref, config] of operatorGroup) {
                res.push({
                    ...config,
                    ref
                });
            }
            return res;
        }
        return null;
    }

    setCaption(group, value) {
        if (!(typeof group === "string") || group === "") {
            throw new TypeError("group name must be a non empty string");
        }
        this.#captions.set(group, value);
        const event = new Event("caption");
        event.group = group;
        event.caption = value;
        this.dispatchEvent(event);
    }

    getCaption(group) {
        return this.#captions.get(group);
    }

    #getOperatorGroup(group) {
        if (this.#operators.has(group)) {
            return this.#operators.get(group);
        }
        const operators = new Map();
        this.#operators.set(group, operators);
        return operators;
    }

    #notifyChange = debounceByType((group) => {
        const event = new Event("change");
        event.group = group;
        this.dispatchEvent(event);
    });

}

export default new LogicOperatorRegistry();
