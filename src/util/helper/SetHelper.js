class SetHelper {

    merge(...sources) {
        const target = new Set();
        for (const source of sources) {
            if (source instanceof Set) {
                for (const value of source) {
                    target.add(value);
                }
            }
        }
        return target;
    }

    mergeInto(target, ...sources) {
        for (const source of sources) {
            if (source instanceof Set) {
                for (const value of source) {
                    target.add(value);
                }
            }
        }
        return target;
    }

}

export default new SetHelper;
