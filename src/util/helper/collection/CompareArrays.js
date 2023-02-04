export function diffArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new TypeError("only arrays are comparable");
    }
    const c = new Set(b);
    return a.filter((d) => !c.has(d));
}

export function symDiffArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new TypeError("only arrays are comparable");
    }
    return diffArray(a, b).concat(diffArray(b, a));
}

export function intersectArray(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) {
        throw new TypeError("only arrays are comparable");
    }
    const c = new Set(b);
    return a.filter((d) => c.has(d));
}
