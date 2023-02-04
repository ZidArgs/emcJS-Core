export function saveSetAttribute(node, name, value) {
    if (value != null) {
        node.setAttribute(name, value);
    } else {
        node.removeAttribute(name);
    }
}
