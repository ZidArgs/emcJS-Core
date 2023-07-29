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
        return JSON.parse(node.getAttribute(name));
    } catch {
        return null;
    }
}
