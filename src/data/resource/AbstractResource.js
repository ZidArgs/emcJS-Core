let PATH_SEPARATOR = "/";

export default class AbstractResource extends EventTarget {

    static set pathSeparator(value) {
        if (typeof value === "string") {
            PATH_SEPARATOR = value;
        } else {
            throw new TypeError(`expected type "string" but was "${typeof value}"`);
        }
    }

    static get pathSeparator() {
        return PATH_SEPARATOR;
    }

}
