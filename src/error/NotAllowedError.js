export default class NotAllowedError extends Error {

    constructor(...args) {
        super(...args);
        this.name = this.constructor.name;
    }

}
