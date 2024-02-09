
export default class LogicDataStorage {

    #data = new Map();

    #changes = new Map();

    #augments = new Map();

    #deletedAugments = new Set();

    setData(data = {}) {
        for (const [key, value] of Object.entries(data)) {
            this.#changes.set(key, value);
        }
    }

    set(key, value) {
        this.#changes.set(key, value);
    }

    get(key) {
        return this.#changes.get(key) ?? this.#data.get(key);
    }

    hasChange(key) {
        return this.#changes.has(key);
    }

    flush() {
        for (const [key, value] of this.#changes) {
            this.#data.set(key, value);
        }
        this.#changes.clear();
    }

    clear() {
        this.#data.clear();
        this.#changes.clear();
        this.#augments.clear();
    }

    // ---

    setAugmented(key, value) {
        this.#augments.set(key, value);
        this.#deletedAugments.delete(key);
    }

    deleteAugmented(key) {
        if (this.#augments.get(key)) {
            this.#augments.delete(key);
            this.#deletedAugments.add(key);
        }
    }

    getAugmented(key) {
        return this.#augments.get(key) ?? this.#changes.get(key) ?? this.#data.get(key);
    }

    clearAugments() {
        this.#augments.clear();
        this.#deletedAugments.clear();
    }

    flushAugments() {
        this.#deletedAugments.clear();
    }

    // ---

    getAll() {
        const res = {};
        for (const [key, value] of this.#data) {
            res[key] = value;
        }
        for (const [key, value] of this.#changes) {
            res[key] = value;
        }
        for (const [key, value] of this.#augments) {
            res[key] = value;
        }
        return res;
    }

    getAllChanges() {
        const res = {};
        for (const [key, value] of this.#changes) {
            res[key] = value;
        }
        for (const [key, value] of this.#augments) {
            res[key] = value;
        }
        for (const key of this.#deletedAugments) {
            res[key] = this.get(key);
        }
        return res;
    }

    getAllAugments() {
        const res = {};
        for (const [key, value] of this.#augments) {
            res[key] = value;
        }
        for (const key of this.#deletedAugments) {
            res[key] = this.get(key);
        }
        return res;
    }

    // ---

    get restricted() {
        return {
            hasChange: this.hasChange.bind(this),
            get: this.get.bind(this),
            setAugmented: this.setAugmented.bind(this),
            deleteAugmented: this.deleteAugmented.bind(this),
            getAugmented: this.getAugmented.bind(this)
        };
    }

}
