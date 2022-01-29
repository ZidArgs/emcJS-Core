
const TEMPLATE_PLACEHOLDER = /\$\{(.*?)\}/;

class StringHelper {

    applyTemplate(text, values) {
        let match;
        while ((match = TEMPLATE_PLACEHOLDER.exec(text)) != null) {
            const substitute = values[match[1]] || "";
            text = text.replace(match[0], substitute);
        }
        return text;
    }

}

export default new StringHelper;
