export function getInnerText(node) {
    let res = "";
    for (const ch of node.shadowRoot?.childNodes ?? node.childNodes) {
        res += recursiveExtractText(ch);
    }
    return res;
}

function recursiveExtractText(node) {
    if (node.assignedSlot == null) {
        if (node instanceof HTMLStyleElement || node instanceof HTMLScriptElement) {
            return "";
        }
        if (node instanceof HTMLSlotElement) {
            let res = "";
            const assignedNodes = node.assignedNodes();
            if (assignedNodes.length) {
                for (const ch of assignedNodes) {
                    res += recursiveExtractSlottedText(ch);
                }
            } else {
                for (const ch of node.childNodes) {
                    res += recursiveExtractSlottedText(ch);
                }
            }
            return res;
        }
        if (node instanceof HTMLElement) {
            return getInnerText(node);
        }
        if (node instanceof Text) {
            return node.textContent.trim() ?? "";
        }
    }
    return "";
}

function recursiveExtractSlottedText(node) {
    if (node instanceof HTMLStyleElement || node instanceof HTMLScriptElement) {
        return "";
    }
    if (node instanceof HTMLSlotElement) {
        let res = "";
        const assignedNodes = node.assignedNodes();
        if (assignedNodes.length) {
            for (const ch of assignedNodes) {
                res += recursiveExtractSlottedText(ch);
            }
        } else {
            for (const ch of node.childNodes) {
                res += recursiveExtractSlottedText(ch);
            }
        }
        return res;
    }
    if (node instanceof HTMLElement) {
        return getInnerText(node);
    }
    if (node instanceof Text) {
        return node.textContent.trim() ?? "";
    }
    return "";
}
