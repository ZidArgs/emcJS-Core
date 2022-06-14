
import ObservableStorage from "./ObservableStorage.js";

export default class ObservableDefaultValueStorage extends ObservableStorage {

    #defaultValue;

    constructor(defaultValue) {
        super();
        this.#defaultValue = defaultValue;
    }

    getDefault() {
        return this.#defaultValue;
    }

}
