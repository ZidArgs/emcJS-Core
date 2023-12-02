import {
    isEqual
} from "../helper/Comparator.js";
import TypeConfigMap from "../../data/type/TypeConfigMap.js";
import LogicValidator from "../logic/LogicValidator.js";

const IMAGE_PATTERN = /\.(?:apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|bmp|ico|tiff)$/i;
const COLOR_PATTERN = /#(?:0-9a-f){6}/i;

class TypeValidator {

    validate(typeName, data, strict, label) {
        if (typeof label === "string" && label !== "") {
            this.#validate(typeName, data, strict, [`| ${label} |`]);
        } else {
            this.#validate(typeName, data, strict, [`|`]);
        }
    }

    #validate(typeName, data, strict = true, path = []) {
        const typeConfig = TypeConfigMap.get(typeName);
        if (typeConfig == null) {
            throw new Error(`TypeValidator - type "${typeName}" unknown [ ${path.join(" > ")} ]`);
        }
        if (typeof data !== "object" || Array.isArray(data)) {
            throw new Error(`TypeValidator - data has to be a dictionary [ ${path.join(" > ")} ]`);
        }
        if (strict) {
            for (const name in data) {
                if (!(name in typeConfig)) {
                    throw new Error(`TypeValidator - type "${typeName}" does not include attribute "${name}" (strict mode) [ ${path.join(" > ")} ]`);
                }
            }
        }
        for (const [name, def] of Object.entries(typeConfig)) {
            const value = data[name];
            if (value == null) {
                if (!def.optional) {
                    throw new Error(`TypeValidator - type "${typeName}" is missing required attribute "${name}" [ ${path.join(" > ")} ]`);
                }
                continue;
            }
            this.#validateType([...path, `${name} {${def["@type"]}}`], value, def, strict);
        }
    }

    #validateType(path, value, def, strict) {
        const currentType = def["@type"];
        switch (currentType) {
            case "Boolean": {
                this.#validateBoolean(path, value, def, strict);
            } break;
            case "String": {
                this.#validateString(path, value, def, strict);
            } break;
            case "Number": {
                this.#validateNumber(path, value, def, strict);
            } break;
            case "Choice": {
                this.#validateChoice(path, value, def, strict);
            } break;
            case "Image": {
                this.#validateImage(path, value, def, strict);
            } break;
            case "Color": {
                this.#validateColor(path, value, def, strict);
            } break;
            case "Logic": {
                this.#validateLogic(path, value, def, strict);
            } break;
            case "List": {
                this.#validateList(path, value, def, strict);
            } break;
            case "AssociativeList": {
                this.#validateAssociativeList(path, value, def, strict);
            } break;
            case "Relation": {
                this.#validateRelation(path, value, def, strict);
            } break;
            default: {
                this.#validate(currentType, value, strict, path);
            } break;
        }
    }

    #validateBoolean(path, value) {
        if (typeof value !== "boolean") {
            throw new Error(`TypeValidator::Boolean - boolean expected [ ${path.join(" > ")} ]`);
        }
    }

    #validateString(path, value, def) {
        if (typeof value !== "string") {
            throw new Error(`TypeValidator::String - string expected [ ${path.join(" > ")} ]`);
        }
        const r = def.pattern;
        if (r != null && !r.test(value)) {
            throw new Error(`TypeValidator::String - does not match pattern /${def.pattern.source}/ [ ${path.join(" > ")} ]`);
        }
    }

    #validateNumber(path, value, def) {
        if (typeof value !== "number") {
            throw new Error(`TypeValidator::Number - number expected [ ${path.join(" > ")} ]`);
        }
        if (def.decimalPlaces != null && (value.toString().split(".")[1]?.length ?? 0 > def.decimalPlaces)) {
            throw new Error(`TypeValidator::Number - has more than ${def.decimalPlaces} decimals [ ${path.join(" > ")} ]`);
        }
        if (def.min != null && (value < def.min)) {
            throw new Error(`TypeValidator::Number - is less than ${def.min} [ ${path.join(" > ")} ]`);
        }
        if (def.max != null && (value > def.max)) {
            throw new Error(`TypeValidator::Number - is greater than ${def.max} [ ${path.join(" > ")} ]`);
        }
    }

    #validateChoice(path, value, def) {
        if (typeof value !== "string") {
            throw new Error(`TypeValidator::Choice - string expected [ ${path.join(" > ")} ]`);
        }
        if (!def.choices.includes(value)) {
            throw new Error(`TypeValidator::Choice - "${value}" not in list [ ${path.join(" > ")} ]`);
        }
    }

    #validateImage(path, value) {
        if (typeof value !== "string") {
            throw new Error(`TypeValidator::Image - string expected [ ${path.join(" > ")} ]`);
        }
        if (!IMAGE_PATTERN.test(value)) {
            throw new Error(`TypeValidator::Image - does not match file extension (apng, avif, gif, jpg, jpeg, jfif, pjpeg, pjp, png, svg, webp, bmp, ico, tiff) [ ${path.join(" > ")} ]`);
        }
    }

    #validateColor(path, value) {
        if (typeof value !== "string") {
            throw new Error(`TypeValidator::Color - string expected [ ${path.join(" > ")} ]`);
        }
        if (!COLOR_PATTERN.test(value)) {
            throw new Error(`TypeValidator::Color - does not match color definition (#000000 - #ffffff) [ ${path.join(" > ")} ]`);
        }
    }

    #validateLogic(path, value) {
        if (typeof value !== "boolean") {
            if (typeof value !== "object" || Array.isArray(value)) {
                throw new Error(`TypeValidator::Logic - boolean or logic definition expected [ ${path.join(" > ")} ]`);
            }
            try {
                LogicValidator.validate(value);
            } catch (err) {
                throw new Error(`TypeValidator::Logic - not a valid logic [ ${path.join(" > ")} ]`, {cause: err});
            }
        }
    }

    #validateList(path, value, def, strict) {
        if (!Array.isArray(value)) {
            throw new Error(`TypeValidator::List - array expected [ ${path.join(" > ")} ]`);
        }
        if (!def.children.optional && value.length <= 0) {
            throw new Error(`TypeValidator::List - must have at least one child [ ${path.join(" > ")} ]`);
        }
        for (const key in value) {
            const entry = value[key];
            this.#validateType([...path, `${key} {${def.children["@type"]}}`], entry, def.children, strict);
        }
    }

    #validateAssociativeList(path, value, def, strict) {
        if (typeof value !== "object" || Array.isArray(value)) {
            throw new Error(`TypeValidator::AssociativeList - dictionary expected [ ${path.join(" > ")} ]`);
        }
        if (!def.children.optional && Object.keys(value).length <= 0) {
            throw new Error(`TypeValidator::AssociativeList - must have at least one child [ ${path.join(" > ")} ]`);
        }
        for (const key in value) {
            const entry = value[key];
            this.#validateType([...path, `"${key}" {${def.children["@type"]}}`], entry, def.children, strict);
        }
    }

    #validateRelation(path, value, def) {
        if (typeof value !== "object" || Array.isArray(value)) {
            throw new Error(`TypeValidator::Relation - dictionary expected [ ${path.join(" > ")} ]`);
        }
        if (!isEqual(Object.keys(value).sort(), ["name", "type"])) {
            throw new Error(`TypeValidator::Relation - attrbutes restricted to "type" and "name" [ ${path.join(" > ")} ]`);
        }
        if (typeof value.type !== "string") {
            throw new Error(`TypeValidator::Relation - type expected to be a string [ ${path.join(" > ")} ]`);
        }
        if (typeof value.name !== "string") {
            throw new Error(`TypeValidator::Relation - name expected to be a string [ ${path.join(" > ")} ]`);
        }
        if (!def.types.includes(value.type)) {
            throw new Error(`TypeValidator::Relation - type "${value.type}" not in accepted types [ ${path.join(" > ")} ]`);
        }
    }

}

export default new TypeValidator();
