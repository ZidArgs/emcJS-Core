
import ObservableStorage from "./ObservableStorage.js";

export default class ObservableDefaultValueStorage extends ObservableStorage {

    #defaultValue;

    constructor(defaultValue) {
        super();
        this.#defaultValue = defaultValue;
    }

    clone() {
        const instance = super.clone();
        instance.#defaultValue = this.#defaultValue;
        return instance;
    }

    getDefault() {
        return this.#defaultValue;
    }

}
