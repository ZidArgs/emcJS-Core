import {
    isBoolean,
    isNumber,
    isString,
    isStringNotEmpty
} from "./CheckType.js";

export function getBooleanOrDefault(value, def) {
    if (isBoolean(value)) {
        return value;
    }
    return def;
}

export function getNumberOrDefault(value, def) {
    if (isNumber(value)) {
        return value;
    }
    return def;
}

export function getStringOrDefault(value, def) {
    if (isString(value)) {
        return value;
    }
    return def;
}

export function getStringNotEmptyOrDefault(value, def) {
    if (isStringNotEmpty(value)) {
        return value;
    }
    return def;
}
