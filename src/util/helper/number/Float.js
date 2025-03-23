import {delimitInteger} from "./Integer.js";

export function delimitFloat(value, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
    if (isNaN(value)) {
        return NaN;
    }
    min = parseFloat(min);
    max = parseFloat(max);
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

export function randomFloat(min = 0, max = Number.MAX_VALUE, fractionDigits = 20) {
    min = parseFloat(min);
    max = parseFloat(max);
    fractionDigits = delimitInteger(fractionDigits, 0, 20);
    if (isNaN(min) || isNaN(max)) {
        return NaN;
    }
    if (isNaN(fractionDigits)) {
        fractionDigits = 20;
    }
    if (min > max) {
        [min, max] = [max, min];
    }
    max -= min;
    const result = Math.random() * (max + 1) + min;
    return parseFloat(result.toFixed(fractionDigits));
}
