import {
    numberedStringComparator, isEqual
} from "../Comparator.js";
import {
    getInnerText
} from "./ExtractText.js";

export function nodeTextComparator(a, b) {
    const textA = a.comparatorText ?? getInnerText(a);
    const textB = b.comparatorText ?? getInnerText(b);
    return numberedStringComparator(textA.toLowerCase(), textB.toLowerCase());
}

export function sortChildren(containerEl, selector = "*") {
    const nodeList = Array.from(containerEl.children).filter((el) => el.matches(selector));
    const sortedNodeList = [...nodeList].sort(nodeTextComparator);
    if (!isEqual(nodeList, sortedNodeList)) {
        for (const el of sortedNodeList) {
            containerEl.append(el);
        }
    }
    return sortedNodeList;
}

export function sortSlotted(slotEl, selector = "*") {
    const nodeList = slotEl.assignedElements({flatten: true}).filter((el) => el.matches(selector));
    const sortedNodeList = [...nodeList].sort(nodeTextComparator);
    if (!isEqual(nodeList, sortedNodeList)) {
        for (const el of sortedNodeList) {
            (el.parentElement ?? el.getRootNode() ?? document).append(el);
        }
    }
    return sortedNodeList;
}

export function sortNodeList(nodeList) {
    return [...nodeList].sort(nodeTextComparator);
}
