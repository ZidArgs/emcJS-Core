export default class NotSupportedError extends Error {

    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
    }

}
