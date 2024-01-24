export function isNull(value) {
    return value === null || value === undefined;
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
    if (typeof value === "string") {
        return value !== "";
    }
    return false;
}

export function isDict(value) {
    if (typeof value === "object" && !Array.isArray(value)) {
        return value.constructor === Object;
    }
    return false;
}
