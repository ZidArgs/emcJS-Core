import jsonParse from "../../patches/JSONParser.js";

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const CSS_URL_PATTERN = /^url\((?:"?(.+)"?|'?(.+)'?|(.+))\)$/i;

export function isNull(value) {
    return value === null || value === undefined;
}

export function isNullOrFalse(value) {
    return isNull(value) || value === false;
}

export function isPrimitive(value) {
    if (value == null) {
        return isNull(value);
    }
    const type = typeof value;
    return type !== "object" && type !== "function";
}

export function isEmpty(value) {
    if (value == null) {
        return isNull(value);
    }
    const type = typeof value;
    if (type === "string") {
        return value === "";
    } else if (type === "object") {
        if (Array.isArray(value)) {
            return !value.length;
        }
        return !Object.keys(value).length;
    }
    return false;
}

export function isBoolean(value) {
    return typeof value === "boolean";
}

export function isNumber(value) {
    return typeof value === "number";
}

export function isNumberNotNaN(value) {
    return isNumber(value) && !isNaN(value);
}

export function isNumberIsNaN(value) {
    return isNumber(value) && isNaN(value);
}

export function isString(value) {
    return typeof value === "string";
}

export function isStringNotEmpty(value) {
    return isString(value) && value !== "";
}

export function isStringIsEmpty(value) {
    return isString(value) && value === "";
}

export function isObject(value) {
    return typeof value === "object" && !isNull(value) && !Array.isArray(value);
}

export function isDict(value) {
    if (isObject(value)) {
        return value.constructor === Object;
    }
    return false;
}

export function isArray(value) {
    return Array.isArray(value);
}

export function isFunction(value) {
    return typeof value === "function";
}

export function isColorString(value) {
    return isStringNotEmpty(value) && COLOR_PATTERN.test(value);
}

export function isJSON(input) {
    try {
        jsonParse(input);
    } catch {
        return false;
    }
    return true;
}

export function isUrl(input) {
    if (!isStringNotEmpty(input)) {
        return false;
    }
    try {
        new URL(input, self.location.origin);
        return true;
    } catch {
        return false;
    }
}

export function isHttpUrl(input) {
    if (!isStringNotEmpty(input)) {
        return false;
    }
    try {
        const url = new URL(input, self.location.origin);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
}

export function isCSSUrl(input) {
    if (!isStringNotEmpty(input)) {
        return false;
    }
    try {
        const res = CSS_URL_PATTERN.exec(input);
        if (res != null) {
            new URL(res[1], self.location.origin);
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export function isArrayOf(input, callback) {
    if (!isArray(input)) {
        return false;
    }
    return input.every((value) => {
        return callback(value);
    });
}

export function isDictOf(input, callback) {
    if (!isDict(input)) {
        return false;
    }
    return Object.values(input).every((value) => {
        return callback(value);
    });
}

export function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}
