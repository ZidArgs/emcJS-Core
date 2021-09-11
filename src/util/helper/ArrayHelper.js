class ArrayHelper {
    
    diff(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        const c = new Set(b);
        return a.filter(d => !c.has(d));
    }
      
    symDiff(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        return this.diff(a, b).concat(this.diff(b, a));
    }
    
    intersect(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            throw new TypeError("only arrays are comparable");
        }
        const c = new Set(b);
        return a.filter(d => c.has(d));
    }

}

export default new ArrayHelper;
