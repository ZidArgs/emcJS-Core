class LogicValidator {

    #customValidators = new Map();

    registerCustomValidator(type, validator) {
        this.#customValidators.set(type, validator);
    }

    validate(logic, label) {
        if (typeof label === "string" && label !== "") {
            this.#validate(logic, [`| ${label} |`]);
        } else {
            this.#validate(logic, [`|`]);
        }
    }

    #validate(logic, path = []) {
        if (typeof logic !== "object" || Array.isArray(logic)) {
            throw new Error(`LogicValidator - logic has to be dictionary [ ${path.join(" > ")} ]`);
        }
        if (!("type" in logic)) {
            throw new Error(`LogicValidator - type missing [ ${path.join(" > ")} ]`);
        }
        const currentType = logic["type"];
        if (typeof currentType !== "string") {
            throw new Error(`LogicValidator - type has to be a string [ ${path.join(" > ")} ]`);
        }
        this.#validateType(logic, [...path, `${currentType}`]);
    }

    #validateType(logic, path = []) {
        const currentType = logic["type"];
        switch (currentType) {
            case "string":
            case "value": {
                if (typeof logic["el"] !== "string") {
                    throw new Error(`LogicValidator - el has to be a string [ ${path.join(" > ")} ]`);
                }
            } break;
            case "number": {
                const val = parseInt(logic["el"]);
                if (!isNaN(val)) {
                    throw new Error(`LogicValidator - el has to be a number [ ${path.join(" > ")} ]`);
                }
            } break;
            case "state": {
                if (typeof logic["el"] !== "string") {
                    throw new Error(`LogicValidator - el has to be a string [ ${path.join(" > ")} ]`);
                }
                if (typeof logic["value"] !== "string" && (typeof logic["value"] !== "number" || isNaN(logic["el"]))) {
                    throw new Error(`LogicValidator - value has to be a string or a number [ ${path.join(" > ")} ]`);
                }
            } break;
            case "and":
            case "nand":
            case "or":
            case "nor":
            case "add":
            case "sub":
            case "mul":
            case "div":
            case "mod": {
                if (!Array.isArray(logic["el"])) {
                    throw new Error(`LogicValidator - el has to be a list of logic elements [ ${path.join(" > ")} ]`);
                }
                if (logic["el"].length < 1) {
                    throw new Error(`LogicValidator - el has to at least contain one logic element [ ${path.join(" > ")} ]`);
                }
                for (const key in logic["el"]) {
                    const value = logic["el"][key];
                    this.#validate(value, [...path, `{${key}}`]);
                }
            } break;
            case "not": {
                this.#validate(logic["el"], path);
            } break;
            case "xor":
            case "xnor":
            case "eq":
            case "neq":
            case "lt":
            case "lte":
            case "gt":
            case "gte":
            case "pow": {
                if (!Array.isArray(logic["el"])) {
                    throw new Error(`LogicValidator - el has to be a list of 2 logic elements [ ${path.join(" > ")} ]`);
                }
                if (logic["el"].length < 1) {
                    throw new Error(`LogicValidator - el has to at least contain 1 logic element [ ${path.join(" > ")} ]`);
                }
                if (logic["el"].length > 2) {
                    throw new Error(`LogicValidator - el has to at max contain 2 logic element [ ${path.join(" > ")} ]`);
                }
                for (const key in logic["el"]) {
                    const value = logic["el"][key];
                    this.#validate(value, [...path, `{${key}}`]);
                }
            } break;
            case "min":
            case "max": {
                this.#validate(logic["el"], path);
                const val = parseInt(logic["value"]);
                if (!isNaN(val)) {
                    throw new Error(`LogicValidator - value has to be a number [ ${path.join(" > ")} ]`);
                }
            } break;
            default: {
                if (currentType !== "true" && currentType !== "false") {
                    throw new Error(`LogicValidator - unknown type [ ${path.join(" > ")} ]`);
                }
            } break;
        }
    }

}

export default new LogicValidator();
