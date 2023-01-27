import Comparator from "../Comparator.js";

function nodeTextComparator(a, b) {
    return a.innerText.toLowerCase().localeCompare(b.innerText.toLowerCase());
}

export function sortChildren(containerEl, selector = "*") {
    const nodeList = Array.from(containerEl.children).filter((el) => el.matches(selector));
    const sortedNodeList = [...nodeList].sort(nodeTextComparator);
    if (!Comparator.isEqual(nodeList, sortedNodeList)) {
        for (const el of sortedNodeList) {
            containerEl.append(el);
        }
    }
    return sortedNodeList;
}

export function sortSlotted(slotEl, selector = "*") {
    const nodeList = slotEl.assignedElements({flatten: true}).filter((el) => el.matches(selector));
    const sortedNodeList = [...nodeList].sort(nodeTextComparator);
    if (!Comparator.isEqual(nodeList, sortedNodeList)) {
        for (const el of sortedNodeList) {
            (el.parentElement ?? el.getRootNode() ?? document).append(el);
        }
    }
    return sortedNodeList;
}

export function sortNodeList(nodeList) {
    return [...nodeList].sort(nodeTextComparator);
}
