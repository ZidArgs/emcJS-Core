
import ObservableStorage from "./ObservableStorage.js";

export default class ObservableDefaultValueStorage extends ObservableStorage {

    #defaultValue;

    constructor(defaultValue) {
        super();
        this.#defaultValue = defaultValue;
    }

    setDefault() {
        throw new Error("can not change default value of ObservableDefaultValueStorage");
    }

    getDefault() {
        return this.#defaultValue;
    }

}
