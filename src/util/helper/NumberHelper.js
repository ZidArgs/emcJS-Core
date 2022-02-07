class NumberHelper {

    getInBoundary(value, min, max) {
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

}

export default new NumberHelper;
