class NumberHelper {

    parseInteger(value) {
        const result = parseInt(value);
        if (isNaN(result)) {
            return NaN;
        }
        if (result > Number.MAX_SAFE_INTEGER) {
            return Number.MAX_SAFE_INTEGER;
        }
        if (result < Number.MIN_SAFE_INTEGER) {
            return Number.MIN_SAFE_INTEGER;
        }
        return result;
    }

    delimit(value, min = Number.MIN_VALUE, max = Number.MAX_VALUE) {
        if (isNaN(value)) {
            return NaN;
        }
        min = parseFloat(min);
        max = parseFloat(max);
        if (isNaN(min) || isNaN(max)) {
            return NaN;
        }
        if (min > max) {
            [min, max] = [max, min];
        }
        if (value >= max) {
            return max;
        } else if (value <= min) {
            return min;
        }
        return value;
    }

    delimitInteger(value, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
        if (isNaN(value)) {
            return NaN;
        }
        min = this.parseInteger(min);
        max = this.parseInteger(max);
        if (isNaN(min) || isNaN(max)) {
            return NaN;
        }
        if (min > max) {
            [min, max] = [max, min];
        }
        if (value >= max) {
            return max;
        } else if (value <= min) {
            return min;
        }
        return value;
    }

    random(min = 0, max = Number.MAX_VALUE, fractionDigits = 20) {
        min = parseFloat(min);
        max = parseFloat(max);
        fractionDigits = this.delimitInteger(fractionDigits, 0, 20);
        if (isNaN(min) || isNaN(max)) {
            return NaN;
        }
        if (isNaN(fractionDigits)) {
            fractionDigits = 20
        }
        if (min > max) {
            [min, max] = [max, min];
        }
        max -= min;
        const result = Math.random() * (max + 1) + min;
        return parseFloat(result.toFixed(fractionDigits));
    }

    randomInteger(min = 0, max = Number.MAX_SAFE_INTEGER) {
        min = this.parseInteger(min);
        max = this.parseInteger(max);
        if (isNaN(min) || isNaN(max)) {
            return NaN;
        }
        if (min > max) {
            [min, max] = [max, min];
        }
        max -= min;
        const result = Math.random() * (max + 1) + min;
        return parseInt(result);
    }

}

export default new NumberHelper;
