
class Comparator {

    #comparators = new Map();

    registerComparator(clazz, comparator) {
        if (typeof clazz !== "function" || clazz.prototype == null) {
            throw new TypeError("clazz must be a class or compositor.")
        }
        if (typeof comparator !== "function") {
            throw new TypeError("comparator must be a function.")
        }
        this.#comparators.set(clazz, comparator);
    }

    isEqual(a, b) {
        if (Object.is(a, b)) {
            return true;
        }

        if (typeof a != "object" || !(a instanceof b.constructor || b instanceof a.constructor)) {
            return false;
        }

        // check for registered comparators or equals function
        if (b instanceof a.constructor) {
            if (this.#comparators.has(a.constructor)) {
                const comparator = this.#comparators.get(a.constructor);
                return comparator(a, b);
            }
            if (typeof a.equals === "function") {
                return a.equals(b);
            }
        }
        if (a instanceof b.constructor) {
            if (this.#comparators.has(b.constructor)) {
                const comparator = this.#comparators.get(b.constructor);
                return comparator(b, a);
            }
            if (typeof b.equals === "function") {
                return b.equals(a);
            }
        }

        // check dates
        if (a instanceof Date && b instanceof Date) {
            return a.getTime() === b.getTime();
        }

        // check nodes
        if (a instanceof Node && b instanceof Node) {
            return a === b;
        }

        // check arrays
        if (Array.isArray(a)) {
            if (a.length != b.length) {
                return false;
            }
            return a.every((i, j) => this.isEqual(i, b[j]));
        }

        // check dicts
        const c = Object.keys(a);
        if (c.length != Object.keys(b).length) {
            return false;
        }
        return c.every((i) => b[i] != null && this.isEqual(a[i], b[i]));
    }

}

export default new Comparator();
