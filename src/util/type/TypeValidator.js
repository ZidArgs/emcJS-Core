import {
    isEqual
} from "../helper/Comparator.js";
import TypeConfigMap from "../../data/type/TypeConfigMap.js";
import LogicValidator from "../logic/LogicValidator.js";

const IMAGE_PATTERN = /\.(?:apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|bmp|ico|tiff)$/i;
const COLOR_PATTERN = /#[0-9a-f]{6}/i;

class TypeValidator {

    validate(typeName, value, {label, throwErrors = false, forceAllOptional = false} = {}) {
        label = typeof label === "string" && label !== "" ? `| ${label} |` : "|";

        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`Error validating value\n    typeName has to be a string that is not empty and not "*"`);
        }

        const errors = [];
        this.#validate(typeName, value, [label], forceAllOptional, errors);
        if (throwErrors && errors.length > 0) {
            const msg = errors.map((s) => s.split("\n").join("\n    ")).join("\n    ");
            throw new Error(`Error validating value as "${typeName}"\n    ${msg}`);
        }
        return errors;
    }

    #validate(typeName, data, currentPath, forceAllOptional, errors) {
        const typeConfig = TypeConfigMap.get(typeName);
        if (typeConfig == null) {
            errors.push(`error resolving type "${typeName}": unknown [ ${currentPath.join(" > ")} ]`);
            return;
        }
        if (typeof data !== "object" || Array.isArray(data)) {
            errors.push(`data has to be a dictionary [ ${currentPath.join(" > ")} ]`);
            return;
        }

        const {definition: typeDefinition, parameters: typeParameters} = typeConfig;

        if (!typeParameters.allowExtension) {
            for (const name in data) {
                if (!(name in typeDefinition)) {
                    errors.push(`type "${typeName}" does not include attribute "${name}" and extension is not allowed [ ${currentPath.join(" > ")} ]`);
                }
            }
        }

        for (const [name, attrDefinition] of Object.entries(typeDefinition)) {
            const value = data[name];
            if (value == null) {
                if (!forceAllOptional && !attrDefinition.optional) {
                    errors.push(`type "${typeName}" is missing required attribute "${name}" [ ${currentPath.join(" > ")} ]`);
                }
                continue;
            }
            this.#validateType([...currentPath, `${name} {${attrDefinition["@type"]}}`], value, attrDefinition, forceAllOptional, errors);
        }
    }

    #validateType(currentPath, value, attrDefinition, forceAllOptional, errors) {
        const currentType = attrDefinition["@type"];
        switch (currentType) {
            case "List": {
                this.#validateList(currentPath, value, attrDefinition, forceAllOptional, errors);
            } break;
            case "AssociativeList": {
                this.#validateAssociativeList(currentPath, value, attrDefinition, forceAllOptional, errors);
            } break;
            case "Relation": {
                this.#validateRelation(currentPath, value, attrDefinition, errors);
            } break;
            case "Boolean": {
                this.#validateBoolean(currentPath, value, attrDefinition, errors);
            } break;
            case "String": {
                this.#validateString(currentPath, value, attrDefinition, errors);
            } break;
            case "Number": {
                this.#validateNumber(currentPath, value, attrDefinition, errors);
            } break;
            case "Choice": {
                this.#validateChoice(currentPath, value, attrDefinition, errors);
            } break;
            case "Image": {
                this.#validateImage(currentPath, value, attrDefinition, errors);
            } break;
            case "Color": {
                this.#validateColor(currentPath, value, attrDefinition, errors);
            } break;
            case "Logic": {
                this.#validateLogic(currentPath, value, attrDefinition, errors);
            } break;
            default: {
                this.#validate(currentType, value, currentPath, forceAllOptional, errors);
            } break;
        }
    }

    #validateBoolean(currentPath, value, definition, errors) {
        if (typeof value !== "boolean") {
            errors.push(`boolean expected [ ${currentPath.join(" > ")} ]`);
        }
    }

    #validateString(currentPath, value, definition, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${currentPath.join(" > ")} ]`);
        } else {
            const r = definition.pattern;
            if (r != null && !r.test(value)) {
                errors.push(`does not match pattern /${definition.pattern.source}/ [ ${currentPath.join(" > ")} ]`);
            }
        }
    }

    #validateNumber(currentPath, value, definition, errors) {
        if (typeof value !== "number") {
            errors.push(`number expected [ ${currentPath.join(" > ")} ]`);
        } else if (definition.decimalPlaces != null && (value.toString().split(".")[1]?.length ?? 0 > definition.decimalPlaces)) {
            errors.push(`has more than ${definition.decimalPlaces} decimals [ ${currentPath.join(" > ")} ]`);
        } else if (definition.min != null && (value < definition.min)) {
            errors.push(`is less than ${definition.min} [ ${currentPath.join(" > ")} ]`);
        } else if (definition.max != null && (value > definition.max)) {
            errors.push(`is greater than ${definition.max} [ ${currentPath.join(" > ")} ]`);
        }
    }

    #validateChoice(currentPath, value, definition, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${currentPath.join(" > ")} ]`);
        } else if (!definition.choices.includes(value)) {
            errors.push(`"${value}" not in list [ ${currentPath.join(" > ")} ]`);
        }
    }

    #validateImage(currentPath, value, definition, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${currentPath.join(" > ")} ]`);
        } else if (value !== "" && !IMAGE_PATTERN.test(value)) {
            errors.push(`does not match file extension (apng, avif, gif, jpg, jpeg, jfif, pjpeg, pjp, png, svg, webp, bmp, ico, tiff) [ ${currentPath.join(" > ")} ]`);
        }
    }

    #validateColor(currentPath, value, definition, errors) {
        if (typeof value !== "string") {
            errors.push(`string expected [ ${currentPath.join(" > ")} ]`);
        } else if (!COLOR_PATTERN.test(value)) {
            errors.push(`does not match color (#000000 - #ffffff) [ ${currentPath.join(" > ")} ]`);
        }
    }

    #validateLogic(currentPath, value, definition, errors) {
        if (typeof value !== "boolean") {
            if (typeof value !== "object" || Array.isArray(value)) {
                errors.push(`boolean or logic definition expected [ ${currentPath.join(" > ")} ]`);
            } else {
                const logicErrors = LogicValidator.validate(value, {allowEmpty: false});
                if (logicErrors.length > 0) {
                    errors.push(`not a valid logic [ ${currentPath.join(" > ")} ]\n${logicErrors.map((s) => `\t${s}`).join("\n")}`);
                }
            }
        }
    }

    #validateList(currentPath, value, definition, forceAllOptional, errors) {
        if (!Array.isArray(value)) {
            errors.push(`array expected [ ${currentPath.join(" > ")} ]`);
        } else if (!definition.children.optional && value.length <= 0) {
            errors.push(`must have at least one child [ ${currentPath.join(" > ")} ]`);
        } else {
            for (const key in value) {
                const entry = value[key];
                this.#validateType([...currentPath, `${key} {${definition.children["@type"]}}`], entry, definition.children, forceAllOptional, errors);
            }
        }
    }

    #validateAssociativeList(currentPath, value, definition, forceAllOptional, errors) {
        if (typeof value !== "object" || Array.isArray(value)) {
            errors.push(`dictionary expected [ ${currentPath.join(" > ")} ]`);
        } else if (!definition.children.optional && Object.keys(value).length <= 0) {
            errors.push(`must have at least one child [ ${currentPath.join(" > ")} ]`);
        } else {
            for (const key in value) {
                const entry = value[key];
                this.#validateType([...currentPath, `"${key}" {${definition.children["@type"]}}`], entry, definition.children, forceAllOptional, errors);
            }
        }
    }

    #validateRelation(currentPath, value, definition, errors) {
        if (typeof value !== "object" || Array.isArray(value)) {
            errors.push(`dictionary expected [ ${currentPath.join(" > ")} ]`);
        } else if (!isEqual(Object.keys(value).sort(), ["name", "type"])) {
            errors.push(`attributes restricted to "type" and "name" [ ${currentPath.join(" > ")} ]`);
        } else if (typeof value.type !== "string") {
            errors.push(`type expected to be a string [ ${currentPath.join(" > ")} ]`);
        } else if (typeof value.name !== "string") {
            errors.push(`name expected to be a string [ ${currentPath.join(" > ")} ]`);
        } else if (value.type !== "" && !definition.types.includes("*") && !definition.types.includes(value.type)) {
            errors.push(`type "${value.type}" not in accepted types [ ${currentPath.join(" > ")} ]`);
        }
    }

}

export default new TypeValidator();
