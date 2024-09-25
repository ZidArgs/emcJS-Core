import {
    isArray,
    isDict
} from "../CheckType.js";

export function dictToRecords(input, keyProperty = "key") {
    if (!isDict(input)) {
        throw new Error("input must be a dict");
    }
    const result = [];
    for (const [key, value] of Object.entries(input)) {
        if (isDict(value)) {
            result.push({
                ...value,
                [keyProperty]: key
            });
        }
    }
    return result;
}

export function recordsToDict(input, keyProperty = "key") {
    if (!isArray(input)) {
        throw new Error("input must be an array");
    }
    const result = {};
    for (const record of input) {
        if (isDict(record)) {
            const key = record[keyProperty];
            if (key != null) {
                result[key] = record;
            }
        }
    }
    return result;
}
