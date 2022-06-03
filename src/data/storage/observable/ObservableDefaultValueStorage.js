
import ObservableStorage from "./ObservableStorage.js";

export default class ObservableDefaultValueStorage extends ObservableStorage {

    #defaultValue;

    constructor(defaultValue) {
        super();
        this.#defaultValue = defaultValue;
    }

    get(key) {
        return super.get(key) ?? this.#defaultValue;
    }

}
