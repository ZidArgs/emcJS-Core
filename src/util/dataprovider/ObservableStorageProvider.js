import AppStateStorageWrapper from "../../data/state/AppStateStorageWrapper.js";
import ObservableStorage from "../../data/storage/observable/ObservableStorage.js";
import EventTargetManager from "../event/EventTargetManager.js";
import {isObject} from "../helper/CheckType.js";
import {extractData} from "../helper/collection/ExtractDataFromArray.js";
import {deepClone} from "../helper/DeepClone.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

export default class ObservableStorageProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source;

    #eventManager = new EventTargetManager();

    constructor(reciever, source, multiSort, initialOptions) {
        super(reciever, multiSort, initialOptions);
        if (source != null && !(source instanceof ObservableStorage) && !(source instanceof AppStateStorageWrapper)) {
            throw new Error("source must be a ObservableStorage or AppStateStorageWrapper");
        }
        /* --- */
        this.#eventManager.set(["change", "clear", "load"], () => {
            this.refresh();
        });
        /* --- */
        this.#source = source;
        if (source != null) {
            this.#eventManager.switchTarget(source);
        }
    }

    get resultSize() {
        return this.#resultSize;
    }

    setSource(source) {
        if (!(source != null && source instanceof ObservableStorage) && !(source instanceof AppStateStorageWrapper)) {
            throw new Error("source must be a ObservableStorage or AppStateStorageWrapper");
        }
        this.#source = source;
        if (source != null) {
            this.#eventManager.switchTarget(source);
        }
        this.refresh();
    }

    async getData(options = {}) {
        if (this.#source == null) {
            this.#resultSize = 0;
            return [];
        }

        const result = extractData([...this.#source].map(([key, value]) => {
            if (!isObject(value)) {
                throw new Error("source contained non object value");
            }
            return {
                ...deepClone(value),
                key
            };
        }), options);

        this.#resultSize = result.total;
        return result.records;
    }

}
