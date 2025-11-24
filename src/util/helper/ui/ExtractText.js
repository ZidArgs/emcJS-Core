import SelectEntry from "../../../ui/form/element/components/SelectEntry.js";
import {instanceOfOne} from "../Class.js";

export function getInnerText(node, excludedNodeClasses = []) {
    const children = node.shadowRoot?.childNodes ?? node.childNodes;
    if (children == null) {
        return;
    }
    let res = "";
    for (const ch of children) {
        res += recursiveExtractText(ch, excludedNodeClasses);
    }
    return res;
}

export function getInputElementInnerText(node, excludedNodeClasses = []) {
    return getInnerText(node, [HTMLOptionElement, SelectEntry, ...excludedNodeClasses]);
}

function recursiveExtractText(node, excludedNodeClasses = []) {
    if (node.assignedSlot == null) {
        if (node instanceof HTMLStyleElement || node instanceof HTMLScriptElement || instanceOfOne(node, ...excludedNodeClasses)) {
            return "";
        }
        if (node instanceof HTMLSlotElement) {
            let res = "";
            const assignedNodes = node.assignedNodes();
            if (assignedNodes.length) {
                for (const ch of assignedNodes) {
                    res += recursiveExtractSlottedText(ch, excludedNodeClasses);
                }
            } else {
                for (const ch of node.childNodes) {
                    res += recursiveExtractSlottedText(ch, excludedNodeClasses);
                }
            }
            return res;
        }
        if (node instanceof HTMLElement) {
            return getInnerText(node, excludedNodeClasses);
        }
        if (node instanceof Text) {
            return node.textContent.trim() ?? "";
        }
    }
    return "";
}

function recursiveExtractSlottedText(node, excludedNodeClasses = []) {
    if (node instanceof HTMLStyleElement || node instanceof HTMLScriptElement || instanceOfOne(node, ...excludedNodeClasses)) {
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
        return getInnerText(node, excludedNodeClasses);
    }
    if (node instanceof Text) {
        return node.textContent.trim() ?? "";
    }
    return "";
}
