export function toStartUppercase(string) {
    if (typeof string === "string" && string) {
        return `${toSafeUppercase(string[0])}${string.slice(1)}`;
    }
    return "";
}

export function toStartUppercaseEndLowercase(string) {
    if (typeof string === "string" && string) {
        return `${toSafeUppercase(string[0])}${string.slice(1).toLowerCase()}`;
    }
    return "";
}

export function dashedToCamelCase(string) {
    if (typeof string === "string" && string) {
        return string.replace(/-(.)/g, (_, m1) => toSafeUppercase(m1));
    }
    return "";
}

function toSafeUppercase(string) {
    return string.split("ß").map((s) => s.toUpperCase()).join("ẞ");
}
