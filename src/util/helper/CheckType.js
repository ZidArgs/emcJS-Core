const COLOR_PATTERN = /#[0-9a-f]{6}/i;

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

export function isStringNotEmpty(value) {
    return typeof value === "string" && value !== "";
}

export function isDict(value) {
    if (typeof value === "object" && !Array.isArray(value)) {
        return value.constructor === Object;
    }
    return false;
}

export function isColorString(value) {
    return isStringNotEmpty(value) && COLOR_PATTERN.test(value);
}

export function isJSON(input) {
    try {
        JSON.parse(input);
    } catch {
        return false;
    }
    return true;
}
