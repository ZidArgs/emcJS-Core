export function mergeSets(...sources) {
    const target = new Set();
    for (const source of sources) {
        if (source instanceof Set) {
            for (const value of source) {
                target.add(value);
            }
        }
    }
    return target;
}

export function mergeSetsInto(target, ...sources) {
    for (const source of sources) {
        if (source instanceof Set) {
            for (const value of source) {
                target.add(value);
            }
        }
    }
    return target;
}
