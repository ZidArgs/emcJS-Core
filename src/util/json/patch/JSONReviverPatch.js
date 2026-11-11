const UNDEF = void 0;

export function patchJSONReviver(key, value) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return UNDEF;
    }
    return value;
}
