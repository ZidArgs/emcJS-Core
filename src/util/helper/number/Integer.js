export function parseSafeInteger(value) {
    const result = parseInt(value);
    if (isNaN(result)) {
        return NaN;
    }
    if (result > Number.MAX_SAFE_INTEGER) {
        return Number.MAX_SAFE_INTEGER;
    }
    if (result < Number.MIN_SAFE_INTEGER) {
        return Number.MIN_SAFE_INTEGER;
    }
    return result;
}

export function delimitInteger(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
    if (isNaN(value)) {
        return NaN;
    }
    min = parseSafeInteger(min);
    max = parseSafeInteger(max);
    if (isNaN(min) || isNaN(max)) {
        return NaN;
    }
    if (min > max) {
        [min, max] = [max, min];
    }
    if (value >= max) {
        return max;
    } else if (value <= min) {
        return min;
    }
    return value;
}

export function randomInteger(min = 0, max = Number.MAX_SAFE_INTEGER) {
    min = parseSafeInteger(min);
    max = parseSafeInteger(max);
    if (isNaN(min) || isNaN(max)) {
        return NaN;
    }
    if (min > max) {
        [min, max] = [max, min];
    }
    max -= min;
    const result = Math.random() * (max + 1) + min;
    return parseInt(result);
}
