function createTemplate(src) {
    if (src instanceof HTMLTemplateElement) {
        return src;
    }
    const buf = document.createElement("template");
    if (src instanceof NodeList) {
        for (const node of src) {
            buf.content.append(node);
        }
    } else if (src instanceof HTMLElement || src instanceof Node) {
        buf.content.append(src);
    } else if (typeof src === "string") {
        buf.innerHTML = src;
    }
    return buf;
}

export default class Template {

    #template;

    constructor(template) {
        this.#template = createTemplate(template);
    }

    generate(child) {
        const doc = document.importNode(this.#template.content, true);
        if (child != null) {
            return doc.children[child];
        }
        return doc;
    }

    apply(target) {
        if (target instanceof Document || target instanceof ShadowRoot || target instanceof HTMLElement) {
            target.append(this.generate());
        }
    }

    static generate(template, child) {
        if (template instanceof Template) {
            return template.generate(child);
        }
        if (!(template instanceof HTMLTemplateElement)) {
            template = createTemplate(template);
        }
        const doc = document.importNode(template.content, true);
        if (child != null) {
            return doc.children[child];
        }
        return doc;
    }

}
