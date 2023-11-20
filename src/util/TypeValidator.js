import {
    isEqual
} from "./helper/Comparator.js";

const IMAGE_PATTERN = /.+\\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|bmp|ico|tiff)/i;
const COLOR_PATTERN = /#(0-9a-f){6}/i;

const TypeDefinitions = new Map();

class TypeValidator {

    registerType(typeName, typeConfig) {
        // TODO validate type definition
        TypeDefinitions.set(typeName, typeConfig);
    }

    validate(typeName, data, strict, label) {
        if (typeof label === "string" && label !== "") {
            this.#validate(typeName, data, strict, [`| ${label} |`]);
        } else {
            this.#validate(typeName, data, strict, [`|`]);
        }
    }

    #validate(typeName, data, strict = true, path = []) {
        const typeConfig = TypeDefinitions.get(typeName);
        if (typeConfig == null) {
            throw new Error(`TypeValidator - type "${typeName}" unknown [ ${path.join(" > ")} ]`);
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
        const r = new RegExp(def.pattern);
        if (!r.test(value)) {
            throw new Error(`TypeValidator::String - does not match pattern /${def.pattern}/ [ ${path.join(" > ")} ]`);
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
            throw new Error(`TypeValidator::Color - does not match pattern (#000000 - #ffffff) [ ${path.join(" > ")} ]`);
        }
    }

    #validateLogic(path, value) {
        if (typeof value !== "boolean" && (typeof value !== "object" || Array.isArray(value))) {
            throw new Error(`TypeValidator::Logic - boolean or logic definition expected [ ${path.join(" > ")} ]`);
        }
        // TODO validate logic structure
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
            this.#validateType([...path, `${key}`], entry, def.children, strict);
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
            this.#validateType([...path, `"${key}"`], entry, def.children, strict);
        }
    }

    #validateRelation(path, value, def) {
        if (typeof value !== "object" || Array.isArray(value)) {
            throw new Error(`TypeValidator::Relation - dictionary expected [ ${path.join(" > ")} ]`);
        }
        if (!isEqual(Object.keys(value).sort(), ["type", "value"])) {
            throw new Error(`TypeValidator::Relation - attrbutes restricted to "type" and "value" [ ${path.join(" > ")} ]`);
        }
        if (typeof value.type !== "string") {
            throw new Error(`TypeValidator::Relation - type expected to be a string [ ${path.join(" > ")} ]`);
        }
        if (typeof value.value !== "string") {
            throw new Error(`TypeValidator::Relation - value expected to be a string [ ${path.join(" > ")} ]`);
        }
        if (!def.types.includes(value.type)) {
            throw new Error(`TypeValidator::Relation - type "${value.type}" not in accepted types [ ${path.join(" > ")} ]`);
        }
    }

}

export default new TypeValidator();

/*
for validation (remember to ignore a possible "default" value):
{
    "Boolean": {
        "__type__": "!String",
        "optional": "!Boolean"
    },
    "String": {
        "__type__": "!String",
        "optional": "!Boolean",
        "pattern": "RegExp"
    },
    "Number": {
        "__type__": "!String",
        "optional": "!Boolean",
        "decimalPlaces": "Number",
        "min": "Number",
        "max": "Number"
    },
    "Choice": {
        "__type__": "!String",
        "optional": "!Boolean",
        "choices": "![String]"
    },
    "Image": {
        "__type__": "!String",
        "optional": "!Boolean"
    },
    "Color": {
        "__type__": "!String",
        "optional": "!Boolean"
    },
    "Logic": {
        "__type__": "!String",
        "optional": "!Boolean"
    },
    "List": {
        "__type__": "!String",
        "optional": "!Boolean"
        "children": "!Type"
    },
    "AssociativeList": {
        "__type__": "!String",
        "optional": "!Boolean"
        "children": "!Type"
    },
    "Relation": {
        "__type__": "!String",
        "optional": "!Boolean"
        "types": "![String]"
    }
}

*/
