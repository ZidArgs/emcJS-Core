import jsonParse from "../../../patches/JSONParser.js";
import {
    isArrayOf, isStringNotEmpty
} from "../CheckType.js";
import {dashedToCamelCase} from "../string/ConvertCase.js";

export function setAttributes(el, attr) {
    const attributeList = el.constructor.attributes ?? [];

    if (!isArrayOf(attributeList, isStringNotEmpty)) {
        throw new Error("can not create form element, class attributes can only be null or an array of strings");
    }

    for (const name in attr) {
        const value = attr[name];
        if (attributeList.includes(name)) {
            el[name] = value;
        } else {
            safeSetAttribute(el, name, value);
        }
    }
}

export function safeSetAttribute(node, name, value) {
    if (value != null) {
        if (typeof value === "object") {
            node.setAttribute(name, JSON.stringify(value));
        } else if (typeof value === "boolean") {
            if (value) {
                node.setAttribute(name, "");
            } else {
                node.removeAttribute(name);
            }
        } else {
            node.setAttribute(name, value);
        }
    } else {
        node.removeAttribute(name);
    }
}

export function setBooleanAttribute(node, name, value) {
    if (typeof value === "boolean") {
        if (value) {
            node.setAttribute(name, "");
        } else {
            node.removeAttribute(name);
        }
    } else {
        node.setAttribute(name, value);
    }
}

export function getBooleanAttribute(node, name) {
    const value = node.getAttribute(name);
    if (value == null || value === "false") {
        return false;
    }
    return true;
}

export function setJSONAttribute(node, name, value) {
    if (value != null) {
        node.setAttribute(name, JSON.stringify(value));
    } else {
        node.removeAttribute(name);
    }
}

export function getJSONAttribute(node, name) {
    try {
        return jsonParse(node.getAttribute(name));
    } catch {
        return null;
    }
}

export function getAllAttributes(node) {
    const res = {};
    for (const attr of node.attributes) {
        const attrName = dashedToCamelCase(attr.name);
        res[attrName] = node[attrName] ?? attr.value;
    }
    return res;
}
