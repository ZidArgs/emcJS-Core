const StorageCache = (function() {
    const STATE = new Map();

    class StorageCache {

        serialize() {
            const res = {};
            for (const [key, value] of STATE) {
                res[key] = value;
            }
            return res;
        }

        deserialize(data) {
            STATE.clear();
            for (const key in data) {
                STATE.set(key, data[key]);
            }
        }

        /* STORAGES */
        set(data) {
            for (const key in data) {
                STATE.set(key, data[key]);
            }
        }

    }

    return StorageCache;
})();

self.StorageCache = StorageCache;
