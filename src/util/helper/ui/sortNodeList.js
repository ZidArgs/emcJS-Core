import Comparator from "../Comparator.js";

function nodeTextComparator(a, b) {
    return a.innerText.toLowerCase().localeCompare(b.innerText.toLowerCase());
}

function nodeHTMLComparator(a, b) {
    return a.innerHTML.toLowerCase().localeCompare(b.innerHTML.toLowerCase());
}

export function sortChildrenByText(container, selector = "*") {
    const list = Array.from(container.children).filter((el) => el.matches(selector));
    const sortedList = [...list].sort(nodeTextComparator);
    if (!Comparator.isEqual(list, sortedList)) {
        for (const el of sortedList) {
            container.append(el);
        }
    }
}

export function sortChildrenByHTML(container, selector = "*") {
    const list = Array.from(container.children).filter((el) => el.matches(selector));
    const sortedList = [...list].sort(nodeHTMLComparator);
    if (!Comparator.isEqual(list, sortedList)) {
        for (const el of sortedList) {
            container.append(el);
        }
    }
}
