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

    generate() {
        return document.importNode(TEMPLATE.get(this).content, true);
    }

    static generate(template) {
        if (template instanceof Template) {
            return template.generate();
        }
        if (!(template instanceof HTMLTemplateElement)) {
            template = createTemplate(template);
        }
        return document.importNode(template.content, true);
    }

}
