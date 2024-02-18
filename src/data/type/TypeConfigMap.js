import {
    immute
} from "../Immutable.js";

const TypeConfigurations = new Map();

const INTERNAL_TYPES = [
    "Boolean",
    "String",
    "Number",
    "Choice",
    "Image",
    "Color",
    "Logic",
    "Relation"
];

const INTERNAL_LIST_TYPES = [
    "List",
    "AssociativeList"
];

class TypeConfigMap extends EventTarget {

    isInternalType(typeName) {
        return INTERNAL_TYPES.includes(typeName) || INTERNAL_LIST_TYPES.includes(typeName);
    }

    isListingType(typeName) {
        return INTERNAL_LIST_TYPES.includes(typeName);
    }

    register(typeName, typeConfig) {
        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`TypeConfigMap - typeName has to be a string that is not empty and not "*"`);
        }
        if (typeof typeConfig !== "object" || Array.isArray(typeConfig)) {
            throw new Error(`TypeConfigMap - config has to be a dictionary [ ${typeName} ]`);
        }
        TypeConfigurations.set(typeName, immute({
            parameters: {
                allowExtension: !!(typeConfig.parameters.allowExtension ?? false)
            },
            definition: this.#convertConfig(typeName, typeConfig.definition)
        }));
        const ev = new Event("register");
        ev.data = {typeName};
        this.dispatchEvent(ev);
    }

    registerAll(typeConfigs) {
        if (typeof typeConfigs !== "object" || Array.isArray(typeConfigs)) {
            throw new Error(`TypeConfigMap - typeConfigs has to be a dictionary`);
        }
        const errors = [];
        for (const [typeName, typeConfig] of Object.entries(typeConfigs)) {
            try {
                this.register(typeName, typeConfig);
            } catch (err) {
                errors.push(err);
            }
        }
        if (errors.length) {
            throw new Error(`TypeConfigMap - bulk registration failed for some types`, {cause: errors});
        }
    }

    get(typeName) {
        const typeDefinition = TypeConfigurations.get(typeName);
        if (typeDefinition == null) {
            throw new Error(`TypeConfigMap - no type with name "${typeName}" registered`);
        }
        return typeDefinition;
    }

    #convertConfig(typeName, typeDefinition) {
        const result = {};
        for (const [currentName, attrDefinition] of Object.entries(typeDefinition)) {
            result[currentName] = this.#convertType(typeName, currentName, attrDefinition);
        }
        return result;
    }

    #convertType(typeName, currentName, attrDefinition) {
        if (!("@type" in attrDefinition)) {
            throw new Error(`TypeConfigMap - @type missing [ ${typeName} > ${currentName} ]`);
        }
        if (typeof attrDefinition["@type"] !== "string" || attrDefinition["@type"] === "") {
            throw new Error(`TypeConfigMap - @type has to be a non empty string [ ${typeName} > ${currentName} ]`);
        }

        const currentType = attrDefinition["@type"];
        const currentResult = {
            "@type": currentType
        };

        if ("optional" in attrDefinition) {
            if (typeof attrDefinition["optional"] !== "boolean") {
                throw new Error(`TypeConfigMap - optional has to be a boolean [ ${typeName} > ${currentName} ]`);
            }
            currentResult["optional"] = attrDefinition["optional"];
        }

        switch (currentType) {
            case "String": {
                if ("pattern" in attrDefinition) {
                    if (typeof attrDefinition["pattern"] !== "string") {
                        throw new Error(`TypeConfigMap - pattern has to be a string [ ${typeName} > ${currentName} ]`);
                    }
                    try {
                        currentResult["pattern"] = new RegExp(attrDefinition["pattern"], "i");
                    } catch {
                        throw new Error(`TypeConfigMap - pattern is not a valid RegExp [ ${typeName} > ${currentName} ]`);
                    }
                }
            } break;
            case "Number": {
                if ("decimalPlaces" in attrDefinition) {
                    if (typeof attrDefinition["decimalPlaces"] !== "number") {
                        throw new Error(`TypeConfigMap - decimalPlaces has to be a number [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["decimalPlaces"] = parseInt(attrDefinition["decimalPlaces"]);
                }
                if ("min" in attrDefinition) {
                    if (typeof attrDefinition["min"] !== "number") {
                        throw new Error(`TypeConfigMap - min has to be a number [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["min"] = attrDefinition["min"];
                }
                if ("max" in attrDefinition) {
                    if (typeof attrDefinition["max"] !== "number") {
                        throw new Error(`TypeConfigMap - max has to be a number [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["max"] = attrDefinition["max"];
                }
            } break;
            case "Choice": {
                if (!("choices" in attrDefinition) || !Array.isArray(attrDefinition["choices"])) {
                    throw new Error(`TypeConfigMap - choices has to be an array [ ${typeName} > ${currentName} ]`);
                }
                if (attrDefinition["choices"].some((entry) => typeof entry !== "string")) {
                    throw new Error(`TypeConfigMap - choices can only contain strings [ ${typeName} > ${currentName} ]`);
                }
                currentResult["choices"] = attrDefinition["choices"];
            } break;
            case "List": {
                if ("uniqueKey" in attrDefinition) {
                    if (typeof attrDefinition["uniqueKey"] !== "string") {
                        throw new Error(`TypeConfigMap - uniqueKey has to be a string [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["uniqueKey"] = attrDefinition["uniqueKey"];
                }

                if (!("children" in attrDefinition) || typeof attrDefinition["children"] !== "object" || Array.isArray(attrDefinition["children"])) {
                    throw new Error(`TypeConfigMap - children has to be a type definition [ ${typeName} > ${currentName} ]`);
                }
                currentResult["children"] = this.#convertType(typeName, currentName, attrDefinition["children"]);
            } break;
            case "AssociativeList": {
                if (!("children" in attrDefinition) || typeof attrDefinition["children"] !== "object" || Array.isArray(attrDefinition["children"])) {
                    throw new Error(`TypeConfigMap - children has to be a type definition [ ${typeName} > ${currentName} ]`);
                }
                currentResult["children"] = this.#convertType(typeName, currentName, attrDefinition["children"]);
            } break;
            case "Relation": {
                if (!("types" in attrDefinition) || !Array.isArray(attrDefinition["types"])) {
                    throw new Error(`TypeConfigMap - types has to be an array [ ${typeName} > ${currentName} ]`);
                }
                if (attrDefinition["types"].some((entry) => typeof entry !== "string" || entry === "")) {
                    throw new Error(`TypeConfigMap - types can only contain non empty strings [ ${typeName} > ${currentName} ]`);
                }
                currentResult["types"] = attrDefinition["types"];
            } break;
            default: { // boolean, image, color, logic, custom
            } break;
        }
        return currentResult;
    }

}

export default new TypeConfigMap();
