import {
    isEqual
} from "../helper/Comparator.js";
import TypeConfigMap from "../../data/type/TypeConfigMap.js";
import LogicValidator from "../logic/LogicValidator.js";

const IMAGE_PATTERN = /\.(?:apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|bmp|ico|tiff)$/i;
const COLOR_PATTERN = /#[0-9a-f]{6}/i;

class TypeValidator {

    validate(typeName, value, {label, throwErrors = false, strict = false} = {}) {
        label = typeof label === "string" && label !== "" ? `| ${label} |` : "|";

        const err = [];
        this.#validate(typeName, value, strict, [label], err);
        if (throwErrors && err.length > 0) {
            const msg = err.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error validating value as "${typeName}"\n    ${msg}`);
        }
        return err;
    }

    #validate(typeName, data, strict, path, errors) {
        const typeConfig = TypeConfigMap.get(typeName);
        if (typeConfig == null) {
            errors.push(`error resolving type "${typeName}": unknown [ ${path.join(" > ")} ]`);
            return;
        }
        if (typeof data !== "object" || Array.isArray(data)) {
            errors.push(`data has to be a dictionary [ ${path.join(" > ")} ]`);
            return;
        }
        if (strict) {
            for (const name in data) {
                if (!(name in typeConfig)) {
                    errors.push(`type "${typeName}" does not include attribute "${name}" (strict) [ ${path.join(" > ")} ]`);
                }
            }
        }

        for (const [name, def] of Object.entries(typeConfig)) {
            const value = data[name];
            if (value == null) {
                if (!def.optional) {
                    errors.push(`type "${typeName}" is missing required attribute "${name}" [ ${path.join(" > ")} ]`);
                }
                continue;
            }
            this.#validateType([...path, `${name} {${def["@type"]}}`], value, def, strict, errors);
        }
    }

    #validateType(path, value, def, strict, errors) {
        const currentType = def["@type"];
        switch (currentType) {
            case "Boolean": {
                this.#validateBoolean(path, value, def, strict, errors);
            } break;
            case "String": {
                this.#validateString(path, value, def, strict, errors);
            } break;
            case "Number": {
                this.#validateNumber(path, value, def, strict, errors);
            } break;
            case "Choice": {
                this.#validateChoice(path, value, def, strict, errors);
            } break;
            case "Image": {
                this.#validateImage(path, value, def, strict, errors);
            } break;
            case "Color": {
                this.#validateColor(path, value, def, strict, errors);
            } break;
            case "Logic": {
                this.#validateLogic(path, value, def, strict, errors);
            } break;
            case "List": {
                this.#validateList(path, value, def, strict, errors);
            } break;
            case "AssociativeList": {
                this.#validateAssociativeList(path, value, def, strict, errors);
            } break;
            case "Relation": {
                this.#validateRelation(path, value, def, strict, errors);
            } break;
            default: {
                this.#validate(currentType, value, strict, path, errors);
            } break;
        }
    }

    #validateBoolean(path, value, def, strict, errors) {
        if (typeof value !== "boolean") {
            errors.push(`boolean expected [ ${path.join(" > ")} ]`);
        }
    }

    #validateString(path, value, def, strict, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${path.join(" > ")} ]`);
        } else {
            const r = def.pattern;
            if (r != null && !r.test(value)) {
                errors.push(`does not match pattern /${def.pattern.source}/ [ ${path.join(" > ")} ]`);
            }
        }
    }

    #validateNumber(path, value, def, strict, errors) {
        if (typeof value !== "number") {
            errors.push(`number expected [ ${path.join(" > ")} ]`);
        } else if (def.decimalPlaces != null && (value.toString().split(".")[1]?.length ?? 0 > def.decimalPlaces)) {
            errors.push(`has more than ${def.decimalPlaces} decimals [ ${path.join(" > ")} ]`);
        } else if (def.min != null && (value < def.min)) {
            errors.push(`is less than ${def.min} [ ${path.join(" > ")} ]`);
        } else if (def.max != null && (value > def.max)) {
            errors.push(`is greater than ${def.max} [ ${path.join(" > ")} ]`);
        }
    }

    #validateChoice(path, value, def, strict, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${path.join(" > ")} ]`);
        } else if (!def.choices.includes(value)) {
            errors.push(`"${value}" not in list [ ${path.join(" > ")} ]`);
        }
    }

    #validateImage(path, value, def, strict, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${path.join(" > ")} ]`);
        } else if (value !== "" && !IMAGE_PATTERN.test(value)) {
            errors.push(`does not match file extension (apng, avif, gif, jpg, jpeg, jfif, pjpeg, pjp, png, svg, webp, bmp, ico, tiff) [ ${path.join(" > ")} ]`);
        }
    }

    #validateColor(path, value, def, strict, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${path.join(" > ")} ]`);
        } else if (!COLOR_PATTERN.test(value)) {
            errors.push(`#ffffff) [ ${path.join(" > ")} ]`);
        }
    }

    #validateLogic(path, value, def, strict, errors) {
        if (typeof value !== "boolean") {
            if (typeof value !== "object" || Array.isArray(value)) {
                errors.push(`boolean or logic definition expected [ ${path.join(" > ")} ]`);
            } else {
                const logicErrors = LogicValidator.validate(value, {allowEmpty: false});
                if (logicErrors.length > 0) {
                    errors.push(`not a valid logic [ ${path.join(" > ")} ]\n${logicErrors.map((s) => `\t${s}`).join("\n")}`);
                }
            }
        }
    }

    #validateList(path, value, def, strict, errors) {
        if (!Array.isArray(value)) {
            errors.push(`array expected [ ${path.join(" > ")} ]`);
        } else if (!def.children.optional && value.length <= 0) {
            errors.push(`must have at least one child [ ${path.join(" > ")} ]`);
        } else {
            for (const key in value) {
                const entry = value[key];
                this.#validateType([...path, `${key} {${def.children["@type"]}}`], entry, def.children, strict, errors);
            }
        }
    }

    #validateAssociativeList(path, value, def, strict, errors) {
        if (typeof value !== "object" || Array.isArray(value)) {
            errors.push(`dictionary expected [ ${path.join(" > ")} ]`);
        } else if (!def.children.optional && Object.keys(value).length <= 0) {
            errors.push(`must have at least one child [ ${path.join(" > ")} ]`);
        } else {
            for (const key in value) {
                const entry = value[key];
                this.#validateType([...path, `"${key}" {${def.children["@type"]}}`], entry, def.children, strict, errors);
            }
        }
    }

    #validateRelation(path, value, def, strict, errors) {
        if (typeof value !== "object" || Array.isArray(value)) {
            errors.push(`dictionary expected [ ${path.join(" > ")} ]`);
        } else if (!isEqual(Object.keys(value).sort(), ["name", "type"])) {
            errors.push(`attributes restricted to "type" and "name" [ ${path.join(" > ")} ]`);
        } else if (typeof value.type !== "string") {
            errors.push(`type expected to be a string [ ${path.join(" > ")} ]`);
        } else if (typeof value.name !== "string") {
            errors.push(`name expected to be a string [ ${path.join(" > ")} ]`);
        } else if (!def.types.includes(value.type)) {
            errors.push(`type "${value.type}" not in accepted types [ ${path.join(" > ")} ]`);
        }
    }

}

export default new TypeValidator();
