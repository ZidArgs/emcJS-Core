export default class NumberFormatter {

    #decimalSeperator = ".";

    #fractionalDigits = 2;

    #integralGroupSize = 3;

    #integralGroupRegExp = /\d{1,3}(?=(\d{3})+(?!\d))/g;

    #integralGroupSeperator = " ";

    #fractionalGroupSize = 3;

    #fractionalGroupRegExp = /\d{3}/g;

    #fractionalGroupSeperator = " ";

    set decimalSeperator(value) {
        this.#decimalSeperator = value;
    }

    get decimalSeperator() {
        return this.#decimalSeperator;
    }

    set integralGroupSize(value) {
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            throw new Error("integralGroupSize must be a positive number");
        }
        if (value === 0) {
            this.#integralGroupRegExp = null;
        } else {
            this.#integralGroupRegExp = new RegExp(`\\d{1,${value}}(?=(\\d{${value}})+(?!\\d))`, "g");
        }
        this.#integralGroupSize = value;
    }

    get integralGroupSize() {
        return this.#integralGroupSize;
    }

    set integralGroupSeperator(value) {
        this.#integralGroupSeperator = value;
    }

    get integralGroupSeperator() {
        return this.#integralGroupSeperator;
    }

    set fractionalDigits(value) {
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            this.#fractionalDigits = -1;
        } else {
            this.#fractionalDigits = value;
        }
    }

    get fractionalDigits() {
        return this.#fractionalDigits;
    }

    set fractionalGroupSize(value) {
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            throw new Error("fractionalGroupSize must be a positive number");
        }
        if (value === 0) {
            this.#fractionalGroupRegExp = null;
        } else {
            this.#fractionalGroupRegExp = new RegExp(`\\d{${value}}`, "g");
        }
        this.#fractionalGroupSize = value;
    }

    get fractionalGroupSize() {
        return this.#fractionalGroupSize;
    }

    set fractionalGroupSeperator(value) {
        this.#fractionalGroupSeperator = value;
    }

    get fractionalGroupSeperator() {
        return this.#fractionalGroupSeperator;
    }

    format(number) {
        number = parseFloat(number);
        if (isNaN(number)) {
            return "NaN";
        }

        if (this.#fractionalDigits >= 0) {
            number = number.toFixed(this.#fractionalDigits);
        }
        let [integral, fractional] = number.split(".");

        if (this.#integralGroupRegExp != null) {
            integral = integral.replace(this.#integralGroupRegExp, `$&${this.#integralGroupSeperator}`);
        }

        if (this.#fractionalGroupRegExp != null) {
            fractional = fractional.replace(this.#fractionalGroupRegExp, `$&${this.#fractionalGroupSeperator}`);
        }

        return [integral, fractional].join(this.#decimalSeperator ?? ".");
    }

}
