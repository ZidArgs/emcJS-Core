import {isEqual} from "../helper/Comparator.js";
import TypeConfigMap from "../../data/type/TypeConfigMap.js";
import LogicValidator from "../logic/LogicValidator.js";

const IMAGE_PATTERN = /\.(?:apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|bmp|ico|tiff)$/i;
const COLOR_PATTERN = /#[0-9a-f]{6}/i;

class TypeGenerator {

    generate(typeName, currentValue, generateOptionals = false) {
        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`Error generating type\n    typeName has to be a string that is not empty and not "*"`);
        }
        if (typeof currentValue !== "object" || Array.isArray(currentValue)) {
            throw new Error(`Error generating type\n    currentValue has to be a dictionary`);
        }

        return this.#generate(typeName, currentValue, generateOptionals);
    }

    #generate(typeName, currentValue, generateOptionals) {
        const typeConfig = TypeConfigMap.get(typeName);
        if (typeConfig == null) {
            console.warn(`could not fetch type config for "${typeName}"`);
            return {};
        }

        const resultData = {};
        const {
            definition: typeDefinition, parameters: typeParameters
        } = typeConfig;

        if (typeParameters.allowExtension) {
            for (const name in currentValue) {
                if (!(name in typeDefinition)) {
                    resultData[name] = currentValue[name];
                }
            }
        }

        for (const [name, attrDefinition] of Object.entries(typeDefinition)) {
            const value = currentValue[name];
            if (value != null || (!attrDefinition.optional || generateOptionals)) {
                resultData[name] = this.#generateType(value, attrDefinition, generateOptionals);
            }
        }

        return resultData;
    }

    #generateType(currentValue, attrDefinition, generateOptionals) {
        const currentType = attrDefinition["@type"];
        switch (currentType) {
            case "List": {
                return this.#generateList(currentValue, attrDefinition, generateOptionals);
            }
            case "AssociativeList": {
                return this.#generateAssociativeList(currentValue, attrDefinition, generateOptionals);
            }
            case "Relation": {
                return this.#generateRelation(currentValue, attrDefinition);
            }
            case "Boolean": {
                return this.#generateBoolean(currentValue, attrDefinition);
            }
            case "String": {
                return this.#generateString(currentValue, attrDefinition);
            }
            case "Number": {
                return this.#generateNumber(currentValue, attrDefinition);
            }
            case "Choice": {
                return this.#generateChoice(currentValue, attrDefinition);
            }
            case "Image": {
                return this.#generateImage(currentValue, attrDefinition);
            }
            case "Color": {
                return this.#generateColor(currentValue, attrDefinition);
            }
            case "Logic": {
                return this.#generateLogic(currentValue, attrDefinition);
            }
            default: {
                return this.#generate(currentType, currentValue, generateOptionals);
            }
        }
    }

    #generateBoolean(currentValue, definition) {
        if (currentValue != null) {
            return !!currentValue;
        }
        const defaultValue = definition.default;
        if (defaultValue != null) {
            return !!defaultValue;
        }
        return false;
    }

    #generateString(currentValue, definition) {
        if (currentValue != null) {
            return currentValue.toString();
        }
        const defaultValue = definition.default;
        if (defaultValue != null) {
            return defaultValue.toString();
        }
        return "";
    }

    #generateNumber(currentValue, definition) {
        currentValue = parseFloat(currentValue);
        if (!isNaN(currentValue)) {
            return currentValue;
        }
        const defaultValue = parseFloat(definition.default);
        if (!isNaN(defaultValue)) {
            return defaultValue;
        }
        return 0;
    }

    #generateChoice(currentValue, definition) {
        if (typeof currentValue === "string" && definition.choices.includes(currentValue)) {
            return currentValue;
        }
        const defaultValue = definition.default;
        if (typeof defaultValue === "string" && definition.choices.includes(defaultValue)) {
            return defaultValue;
        }
        return "";
    }

    #generateImage(currentValue, definition) {
        if (typeof currentValue === "string" && IMAGE_PATTERN.test(currentValue)) {
            return currentValue;
        }
        const defaultValue = definition.default;
        if (typeof defaultValue === "string" && IMAGE_PATTERN.test(defaultValue)) {
            return defaultValue;
        }
        return "";
    }

    #generateColor(currentValue, definition) {
        if (typeof currentValue === "string" && COLOR_PATTERN.test(currentValue)) {
            return currentValue;
        }
        const defaultValue = definition.default;
        if (typeof defaultValue === "string" && COLOR_PATTERN.test(defaultValue)) {
            return defaultValue;
        }
        return "";
    }

    #generateLogic(currentValue, definition) {
        if (typeof currentValue === "boolean") {
            return currentValue;
        }
        if (LogicValidator.validate(currentValue, {allowEmpty: false}).length <= 0) {
            return currentValue;
        }
        const defaultValue = definition.default;
        if (typeof defaultValue === "boolean") {
            return defaultValue;
        }
        if (LogicValidator.validate(defaultValue, {allowEmpty: false}).length <= 0) {
            return defaultValue;
        }
        return false;
    }

    #generateList(currentValue, definition, generateOptionals) {
        if (!Array.isArray(currentValue)) {
            if (definition.children.optional) {
                return [];
            }
            return [
                this.#generateType([...`0 {${definition.children["@type"]}}`], null, definition.children, generateOptionals)
            ];
        } else if (currentValue.length <= 0 && !definition.children.optional) {
            return [
                this.#generateType([...`0 {${definition.children["@type"]}}`], null, definition.children, generateOptionals)
            ];
        } else {
            const resultList = [];
            for (const key in currentValue) {
                const entry = currentValue[key];
                resultList[key] = this.#generateType(entry, definition.children, generateOptionals);
            }
            return resultList;
        }
    }

    #generateAssociativeList(currentValue, definition, generateOptionals) {
        if (typeof currentValue !== "object" || Array.isArray(currentValue)) {
            if (definition.children.optional) {
                return {};
            }
            return {"": this.#generateType(null, definition.children, generateOptionals)};
        } else if (Object.keys(currentValue).length <= 0 && !definition.children.optional) {
            return {"": this.#generateType(null, definition.children, generateOptionals)};
        } else {
            const resultList = {};
            for (const key in currentValue) {
                const entry = currentValue[key];
                resultList[key] = this.#generateType(entry, definition.children, generateOptionals);
            }
            return resultList;
        }
    }

    #generateRelation(currentValue, definition) {
        if (typeof currentValue === "object" || !Array.isArray(currentValue) && this.#checkRelation(currentValue, definition.types)) {
            return currentValue;
        }
        const defaultValue = definition.default;
        if (typeof defaultValue === "object" || !Array.isArray(defaultValue) && this.#checkRelation(defaultValue, definition.types)) {
            return defaultValue;
        }
        return {
            "name": "",
            "type": ""
        };
    }

    #checkRelation(currentValue, allowedTypes) {
        if (typeof currentValue !== "object" || Array.isArray(currentValue)) {
            return false;
        } else if (!isEqual(Object.keys(currentValue).sort(), ["name", "type"])) {
            return false;
        } else if (typeof currentValue.type !== "string") {
            return false;
        } else if (typeof currentValue.name !== "string") {
            return false;
        } else if (currentValue.type !== "" && !allowedTypes.includes("*") && !allowedTypes.includes(currentValue.type)) {
            return false;
        }
        return true;
    }

}

export default new TypeGenerator();
