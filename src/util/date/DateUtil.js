const FORMATTER_REGEX = /[YMDhmsz]/g;

export default class DateUtil {

    #date;

    constructor(date) {
        if (date instanceof Date) {
            if (isNaN(date)) {
                throw new TypeError("date is invalid");
            }
            this.#date = date;
        } else if (typeof date == "undefined") {
            this.#date = new Date();
        } else {
            throw new TypeError("date expected");
        }
    }

    format(formatter) {
        if (typeof formatter == "string") {
            return DateUtil.#format(this.#date, formatter);
        } else if (typeof formatter == "undefined") {
            return DateUtil.#format(this.#date);
        } else {
            throw new TypeError("format string expected");
        }
    }

    formatLocal(formatter) {
        if (typeof formatter == "string") {
            return DateUtil.#formatLocal(this.#date, formatter);
        } else if (typeof formatter == "undefined") {
            return DateUtil.#formatLocal(this.#date);
        } else {
            throw new TypeError("format string expected");
        }
    }

    static #format(date, formatter) {
        return formatter.replace(FORMATTER_REGEX, function(m) {
            switch (m) {
                case "Y": return date.getUTCFullYear();
                case "M": return `0${date.getUTCMonth() + 1}`.slice(-2);
                case "D": return `0${date.getUTCDate()}`.slice(-2);
                case "h": return `0${date.getUTCHours()}`.slice(-2);
                case "m": return `0${date.getUTCMinutes()}`.slice(-2);
                case "s": return `0${date.getUTCSeconds()}`.slice(-2);
                case "z": return `00${date.getUTCMilliseconds()}`.slice(-3);
            }
        });
    }

    static #formatLocal(date, formatter) {
        return formatter.replace(FORMATTER_REGEX, function(m) {
            switch (m) {
                case "Y": return date.getFullYear();
                case "M": return `0${date.getMonth() + 1}`.slice(-2);
                case "D": return `0${date.getDate()}`.slice(-2);
                case "h": return `0${date.getHours()}`.slice(-2);
                case "m": return `0${date.getMinutes()}`.slice(-2);
                case "s": return `0${date.getSeconds()}`.slice(-2);
                case "z": return `00${date.getMilliseconds()}`.slice(-3);
            }
        });
    }

    static format(date, formatter) {
        if (date instanceof Date) {
            if (isNaN(date)) {
                throw new TypeError("date is invalid");
            }
            if (formatter != null && typeof formatter != "string") {
                throw new TypeError("formatter is invalid");
            }
            return this.#format(date, formatter ?? "D.M.Y h:m:s");
        }
        throw new TypeError("date is invalid");
    }

    static formatLocal(date, formatter) {
        if (date instanceof Date) {
            if (isNaN(date)) {
                throw new TypeError("date is invalid");
            }
            if (formatter != null && typeof formatter != "string") {
                throw new TypeError("formatter is invalid");
            }
            return this.#formatLocal(date, formatter);
        }
        throw new TypeError("date is invalid");
    }

}
