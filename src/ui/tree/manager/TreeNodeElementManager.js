import ElementManager from "../../../util/html/ElementManager.js";

export default class TreeNodeElementManager extends ElementManager {

    #targetClass;

    constructor(target, targetClass) {
        super(target);
        this.#targetClass = targetClass;
    }

    composer(key, params) {
        const {
            nodeType, startCollapsed = false, children
        } = params;
        const el = this.#targetClass.createNodeType(nodeType);
        el.ref = key;
        if (children != null) {
            el.forceCollapsible = true;
            el.toggleCollapsed(!!startCollapsed);
        } else {
            el.forceCollapsible = false;
        }
        return el;
    }

    mutator(el, key, params) {
        const {
            label = key, data = {}, sorted = false, children, ...attr
        } = params;
        el.label = label;
        el.sorted = sorted;
        for (const name in data) {
            el.dataset[name] = data[name];
        }
        if (children != null) {
            el.loadConfig(children);
            el.forceCollapsible = true;
        } else {
            el.forceCollapsible = false;
        }
        for (const name in attr) {
            const value = attr[name];
            if (value != null) {
                if (typeof value === "object") {
                    el.setAttribute(name, JSON.stringify(value));
                } else if (typeof value === "boolean") {
                    if (value) {
                        el.setAttribute(name, "");
                    } else {
                        el.removeAttribute(name);
                    }
                } else {
                    el.setAttribute(name, value);
                }
            } else {
                el.removeAttribute(name);
            }
        }
    }

}
