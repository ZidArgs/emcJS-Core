export function mergeObjects(...sources) {
    const target = {};
    for (const source of sources) {
        for (const key in source) {
            const value = source[key];
            writeRecursive(target, key, value);
        }
    }
    return target;
}

export function mergeObjectsInto(target, ...sources) {
    for (const source of sources) {
        for (const key in source) {
            const value = source[key];
            writeRecursive(target, key, value);
        }
    }
    return target;
}

function writeRecursive(target, key, value) {
    const oldValue = target[key];
    if (typeof oldValue === "object" && typeof value === "object") {
        for (const bKey in value) {
            const bValue = value[bKey];
            writeRecursive(oldValue, bKey, bValue);
        }
    } else {
        target[key] = value;
    }
}
