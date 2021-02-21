const TEMPLATE = new WeakMap;

function createTemplate(src) {
    if (src instanceof HTMLTemplateElement) {
        return src;
    }
    const buf = document.createElement("template");
    if (src instanceof HTMLElement) {
        buf.append(src);
    } else if (typeof src === "string") {
        buf.innerHTML = src;
    }
    return buf;
}

export default class Template {

    constructor(template) {
        TEMPLATE.set(this, createTemplate(template));
    }

    generate(child) {
        const doc = document.importNode(TEMPLATE.get(this).content, true);
        if (child != null) {
            return doc.children[child];
        }
        return doc;
    }

    static generate(template, child) {
        if (template instanceof Template) {
            return template.generate(child);
        }
        if (!(template instanceof HTMLTemplateElement)) {
            template = createTemplate(template, child);
        }
        const doc = document.importNode(template.content, true);
        if (child != null) {
            return doc.children[child];
        }
        return doc;
    }

}
