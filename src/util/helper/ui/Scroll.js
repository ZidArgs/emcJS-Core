export function getScrollParent(node) {
    const isElement = node instanceof HTMLElement;
    const overflowY = isElement && window.getComputedStyle(node).overflowY;
    const isScrollable = overflowY && !(overflowY.includes("hidden") || overflowY.includes("visible"));

    if (!node) {
        return document.scrollingElement ?? document.body;
    } else if (isScrollable && node.scrollHeight >= node.clientHeight) {
        return node;
    }

    return getScrollParent(node.assignedSlot ?? node.parentNode ?? node.getRootNode()?.host);
}

export function scrollIntoViewIfNeeded(node, options) {
    const {behavior = "auto", block, inline, offsetTop = 0, offsetBottom = 0} = options;
    const scrollEl = getScrollParent(node);
    const nodeRect = node.getBoundingClientRect();
    if (nodeRect.top < offsetTop || nodeRect.bottom > scrollEl.clientHeight - offsetBottom) {
        node.scrollIntoView({behavior, block, inline});
    }
}
