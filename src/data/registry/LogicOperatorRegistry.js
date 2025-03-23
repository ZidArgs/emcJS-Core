import {debounceByType} from "../../util/Debouncer.js";
import {isEqual} from "../../util/helper/Comparator.js";
import {deepClone} from "../../util/helper/DeepClone.js";

class LogicOperatorRegistry extends EventTarget {

    #operators = new Map();

    #operatorGroups = new Map();

    #captions = new Map();

    setAndLinkOperator(ref, operatorConfig, ...groupNames) {
        this.setOperator(ref, operatorConfig);
        this.linkOperator(ref, ...groupNames);
    }

    setOperator(ref, operatorConfig) {
        if (this.#operators.has(ref)) {
            const operatorData = this.#operators.get(ref);
            const {
                groups, config
            } = operatorData;
            if (!isEqual(operatorConfig, config)) {
                operatorData.config = deepClone(operatorConfig);
                for (const groupName of groups) {
                    this.#notifyChange(groupName);
                }
            }
        } else {
            const operatorData = {
                config: deepClone(operatorConfig),
                groups: new Set()
            };
            this.#operators.set(ref, operatorData);
        }
    }

    getOperator(ref) {
        const operatorData = this.#operators.get(ref);
        if (operatorData != null) {
            const {config} = operatorData;
            return config;
        }
        return null;
    }

    deleteOperator(ref) {
        const operatorData = this.#operators.get(ref);
        if (operatorData != null) {
            const {groups} = operatorData;
            this.#operators.delete(ref);
            for (const groupName of groups) {
                const group = this.#operatorGroups.get(groupName);
                if (group != null) {
                    group.delete(ref);
                }
            }
        }
    }

    linkOperator(ref, ...groupNames) {
        const operatorData = this.#operators.get(ref);
        if (operatorData != null) {
            const {groups} = operatorData;
            for (const groupName of groupNames) {
                if (typeof groupName !== "string" || groupName === "") {
                    throw new TypeError("groupName must be a non empty string");
                }
                const operatorGroup = this.#getOperatorGroup(groupName);
                if (!operatorGroup.has(ref)) {
                    operatorGroup.add(ref);
                    groups.add(groupName);
                    this.#notifyChange(groupName);
                }
            }
        }
    }

    unlinkOperator(ref, ...groupNames) {
        const operatorData = this.#operators.get(ref);
        if (operatorData != null) {
            const {groups} = operatorData;
            for (const groupName of groupNames) {
                if (typeof groupName !== "string" || groupName === "") {
                    throw new TypeError("groupName must be a non empty string");
                }
                if (this.#operatorGroups.has(groupName)) {
                    const operatorGroup = this.#operatorGroups.get(groupName);
                    if (operatorGroup.has(ref)) {
                        operatorGroup.delete(ref);
                        groups.delete(groupName);
                        this.#notifyChange(groupName);
                    }
                }
            }
        }
    }

    clearGroup(groupName) {
        if (typeof groupName !== "string" || groupName === "") {
            throw new TypeError("groupName must be a non empty string");
        }
        if (this.#operatorGroups.has(groupName)) {
            const operatorGroup = this.#operatorGroups.get(groupName);
            for (const ref of operatorGroup) {
                const operatorData = this.#operators.get(ref);
                if (operatorData != null) {
                    const {groups} = operatorData;
                    groups.delete(operatorGroup);
                }
            }
            operatorGroup.clear();
            this.#notifyChange(groupName);
        }
    }

    getGroup(groupName) {
        if (typeof groupName !== "string" || groupName === "") {
            throw new TypeError("groupName must be a non empty string");
        }
        if (this.#operatorGroups.has(groupName)) {
            const operatorGroup = this.#operatorGroups.get(groupName);
            const res = [];
            for (const ref of operatorGroup) {
                const operatorData = this.#operators.get(ref);
                if (operatorData != null) {
                    const {config} = operatorData;
                    res.push({
                        ...config,
                        ref
                    });
                }
            }
            return res;
        }
        return null;
    }

    setGroupCaption(groupName, caption) {
        if (typeof groupName !== "string" || groupName === "") {
            throw new TypeError("groupName must be a non empty string");
        }
        if (typeof caption !== "string") {
            throw new TypeError("caption must be a string");
        }
        this.#captions.set(groupName, caption);
        const event = new Event("caption");
        event.group = groupName;
        event.caption = caption;
        this.dispatchEvent(event);
    }

    getGroupCaption(groupName) {
        if (typeof groupName !== "string" || groupName === "") {
            throw new TypeError("groupName must be a non empty string");
        }
        return this.#captions.get(groupName);
    }

    #getOperatorGroup(groupName) {
        if (this.#operatorGroups.has(groupName)) {
            return this.#operatorGroups.get(groupName);
        }
        const operators = new Set();
        this.#operatorGroups.set(groupName, operators);
        return operators;
    }

    #notifyChange = debounceByType((group) => {
        const event = new Event("change");
        event.group = group;
        this.dispatchEvent(event);
    });

}

export default new LogicOperatorRegistry();
