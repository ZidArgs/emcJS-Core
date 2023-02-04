export function toStartUppercase(string) {
    if (typeof string === "string" && string) {
        return `${string[0].toUpperCase()}${string.slice(1)}`;
    }
    return "";
}

export function toStartUppercaseEndLowercase(string) {
    if (typeof string === "string" && string) {
        return `${string[0].toUpperCase()}${string.slice(1).toLowerCase()}`;
    }
    return "";
}
