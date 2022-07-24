class MapHelper {

    merge(...sources) {
        const target = new Map();
        for (const source of sources) {
            if (source instanceof Map) {
                for (const [key, value] of source) {
                    target.set(key, value);
                }
            }
        }
        return target;
    }

    mergeInto(target, ...sources) {
        for (const source of sources) {
            if (source instanceof Map) {
                for (const [key, value] of source) {
                    target.set(key, value);
                }
            }
        }
        return target;
    }

}

export default new MapHelper;
