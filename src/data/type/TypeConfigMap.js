import {
    immute
} from "../Immutable.js";

const TypeDefinitions = new Map();

class TypeConfigMap extends EventTarget {

    register(typeName, typeConfig) {
        if (typeof typeName !== "string" || typeName === "" || typeName === "*") {
            throw new Error(`TypeConfigMap - typeName has to be a string that is not empty and not "*"`);
        }
        if (typeof typeConfig !== "object" || Array.isArray(typeConfig)) {
            throw new Error(`TypeConfigMap - config has to be a dictionary [ ${typeName} ]`);
        }
        TypeDefinitions.set(typeName, this.#convertConfig(typeName, typeConfig));
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
        const typeConfig = TypeDefinitions.get(typeName);
        if (typeConfig == null) {
            throw new Error(`TypeConfigMap - no type with name "${typeName}" registered`);
        }
        return typeConfig;
    }

    #convertConfig(typeName, typeConfig) {
        const result = {};
        for (const [currentName, definition] of Object.entries(typeConfig)) {
            result[currentName] = this.#convertType(typeName, currentName, definition);
        }
        return immute(result);
    }

    #convertType(typeName, currentName, definition) {
        if (!("@type" in definition)) {
            throw new Error(`TypeConfigMap - @type missing [ ${typeName} > ${currentName} ]`);
        }

        const currentType = definition["@type"];
        const currentResult = {
            "@type": currentType
        };

        if ("optional" in definition) {
            if (typeof definition["optional"] !== "boolean") {
                throw new Error(`TypeConfigMap - optional has to be a boolean [ ${typeName} > ${currentName} ]`);
            }
            currentResult["optional"] = definition["optional"];
        }

        switch (currentType) {
            case "String": {
                if ("pattern" in definition) {
                    if (typeof definition["pattern"] !== "string") {
                        throw new Error(`TypeConfigMap - pattern has to be a string [ ${typeName} > ${currentName} ]`);
                    }
                    try {
                        currentResult["pattern"] = new RegExp(definition["pattern"], "i");
                    } catch {
                        throw new Error(`TypeConfigMap - pattern is not a valid RegExp [ ${typeName} > ${currentName} ]`);
                    }
                }
            } break;
            case "Number": {
                if ("decimalPlaces" in definition) {
                    if (typeof definition["decimalPlaces"] !== "number") {
                        throw new Error(`TypeConfigMap - decimalPlaces has to be a number [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["decimalPlaces"] = parseInt(definition["decimalPlaces"]);
                }
                if ("min" in definition) {
                    if (typeof definition["min"] !== "number") {
                        throw new Error(`TypeConfigMap - min has to be a number [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["min"] = definition["min"];
                }
                if ("max" in definition) {
                    if (typeof definition["max"] !== "number") {
                        throw new Error(`TypeConfigMap - max has to be a number [ ${typeName} > ${currentName} ]`);
                    }
                    currentResult["max"] = definition["max"];
                }
            } break;
            case "Choice": {
                if (!("choices" in definition) || !Array.isArray(definition["choices"])) {
                    throw new Error(`TypeConfigMap - choices has to be an array [ ${typeName} > ${currentName} ]`);
                }
                if (definition["choices"].some((entry) => typeof entry !== "string")) {
                    throw new Error(`TypeConfigMap - choices can only contain strings [ ${typeName} > ${currentName} ]`);
                }
                currentResult["choices"] = definition["choices"];
            } break;
            case "List": {
                if (!("children" in definition) || typeof definition["children"] !== "object" || Array.isArray(definition["children"])) {
                    throw new Error(`TypeConfigMap - children has to be a type definition [ ${typeName} > ${currentName} ]`);
                }
                currentResult["children"] = this.#convertType(typeName, currentName, definition["children"]);
            } break;
            case "AssociativeList": {
                if (!("children" in definition) || typeof definition["children"] !== "object" || Array.isArray(definition["children"])) {
                    throw new Error(`TypeConfigMap - children has to be a type definition [ ${typeName} > ${currentName} ]`);
                }
                currentResult["children"] = this.#convertType(typeName, currentName, definition["children"]);
            } break;
            case "Relation": {
                if (!("types" in definition) || !Array.isArray(definition["types"])) {
                    throw new Error(`TypeConfigMap - types has to be an array [ ${typeName} > ${currentName} ]`);
                }
                if (definition["types"].some((entry) => typeof entry !== "string" || entry === "")) {
                    throw new Error(`TypeConfigMap - types can only contain non empty strings [ ${typeName} > ${currentName} ]`);
                }
                currentResult["types"] = definition["types"];
            } break;
            default: { // boolean, image, color, logic, custom
            } break;
        }
        return currentResult;
    }

}

export default new TypeConfigMap();
