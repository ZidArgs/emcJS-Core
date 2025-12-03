import jsonParse from "../../patches/JSONParser.js";

export function jsonReplacer(key, value) {
    if (value instanceof RegExp) {
        return "__REGEXP::" + value.toString();
    } else {
        return value;
    }
}

export function jsonReviver(key, value) {
    if (value.toString().startsWith("__REGEXP::")) {
        const m = value.split("__REGEXP::")[1].match(/\/(.*)\/(.*)?/);
        return new RegExp(m[1], m[2] || "");
    } else {
        return value;
    }
}

export function jsonParseSafe(value, reviver) {
    if (typeof value !== "string" || value === "") {
        return null;
    }
    try {
        return jsonParse(value, reviver);
    } catch {
        return null;
    }
}
