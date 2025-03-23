import {extractData} from "../helper/collection/ExtractDataFromArray.js";
import {deepClone} from "../helper/DeepClone.js";
import {isObject} from "../helper/CheckType.js";
import TypeStorage from "../../data/type/TypeStorage.js";
import EventTargetManager from "../event/EventTargetManager.js";
import AbstractDataProvider from "./AbstractDataProvider.js";

export default class TypeStorageProvider extends AbstractDataProvider {

    #resultSize = 0;

    #source;

    #eventManager = new EventTargetManager();

    constructor(reciever, source, initialOptions) {
        super(reciever, initialOptions);
        if (source != null && !(source instanceof TypeStorage)) {
            throw new Error("source must be a ObservableStorage");
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
        if (source != null && !(source instanceof TypeStorage)) {
            throw new Error("source must be a TypeStorage");
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

        const typeName = this.#source.typeName;
        const result = extractData([...this.#source].map(([name, value]) => {
            if (!isObject(value)) {
                throw new Error("source contained non object value");
            }
            return {
                ...deepClone(value),
                key: `${name}\n[${typeName}]`,
                entityType: typeName,
                entityName: name,
                entity: {
                    type: typeName,
                    name
                }
            };
        }), options);

        this.#resultSize = result.total;
        return result.records;
    }

}
