import DataReceiverMixin from "./DataReceiverMixin.js";

export default class SimpleDataReceiver extends DataReceiverMixin(Object) {

    #onDataCallback;

    constructor(onDataCallback) {
        super();
        if (typeof onDataCallback !== "function") {
            throw new Error("onDataCallback must be a function");
        }
        this.#onDataCallback = onDataCallback;
    }

    setData(data = []) {
        this.#onDataCallback(data);
    }

}
