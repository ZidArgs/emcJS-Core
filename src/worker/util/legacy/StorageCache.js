{
    class StorageCache {

        #state = new Map();

        serialize() {
            const res = {};
            for (const [key, value] of this.#state) {
                res[key] = value;
            }
            return res;
        }

        deserialize(data) {
            this.#state.clear();
            for (const key in data) {
                this.#state.set(key, data[key]);
            }
        }

        /* STORAGES */
        set(data) {
            for (const key in data) {
                this.#state.set(key, data[key]);
            }
        }

    }

    self.StorageCache = StorageCache;
}
