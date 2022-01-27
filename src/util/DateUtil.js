const FORMATTER_REGEX = /[YMDhmsz]/g;
const DATE = new WeakMap();

class DateUtil {

    constructor(date) {
        if (date instanceof Date) {
            if (isNaN(date)) {
                throw new TypeError("date is invalid");
            }
            DATE.set(this, date);
        } else if (typeof date == "undefined") {
            DATE.set(this, new Date);
        } else {
            throw new TypeError("date expected");
        }
    }

    convert(formatter) {
        if (typeof formatter == "string") {
            return DateUtil.convert(DATE.get(this), formatter);
        } else if (typeof formatter == "undefined") {
            return DateUtil.convert(DATE.get(this));
        } else {
            throw new TypeError("format string expected");
        }
    }

    convertLocal(formatter) {
        if (typeof formatter == "string") {
            return DateUtil.convertLocal(DATE.get(this), formatter);
        } else if (typeof formatter == "undefined") {
            return DateUtil.convertLocal(DATE.get(this));
        } else {
            throw new TypeError("format string expected");
        }
    }

    static convert(date, formatter) {
        if (date instanceof Date) {
            if (isNaN(date)) {
                throw new TypeError("date is invalid");
            }
            if (typeof formatter == "undefined") {
                formatter = "D.M.Y h:m:s";
            }
        } else if (typeof date == "string") {
            formatter = date;
            date = new Date();
        } else {
            date = new Date();
            formatter = "D.M.Y h:m:s";
        }
        return formatter.replace(FORMATTER_REGEX, function(m) {
            switch (m) {
                case "Y": return date.getUTCFullYear();
                case "M": return `0${date.getUTCMonth() + 1}`.slice(-2);
                case "D": return `0${date.getUTCDate()}`.slice(-2);
                case "h": return `0${date.getUTCHours()}`.slice(-2);
                case "m": return `0${date.getUTCMinutes()}`.slice(-2);
                case "s": return `0${date.getUTCSeconds()}`.slice(-2);
                case "z": return `00${date.getUTCMilliseconds()}`.slice(-2);
            }
        });
    }

    static convertLocal(date, formatter) {
        if (date instanceof Date) {
            if (isNaN(date)) {
                throw new TypeError("date is invalid");
            }
            if (typeof formatter == "undefined") {
                formatter = "D.M.Y h:m:s";
            }
        } else if (typeof date == "string") {
            formatter = date;
            date = new Date();
        } else {
            date = new Date();
            formatter = "D.M.Y h:m:s";
        }
        return formatter.replace(FORMATTER_REGEX, function(m) {
            switch (m) {
                case "Y": return date.getFullYear();
                case "M": return `0${date.getMonth() + 1}`.slice(-2);
                case "D": return `0${date.getDate()}`.slice(-2);
                case "h": return `0${date.getHours()}`.slice(-2);
                case "m": return `0${date.getMinutes()}`.slice(-2);
                case "s": return `0${date.getSeconds()}`.slice(-2);
                case "z": return `00${date.getMilliseconds()}`.slice(-2);
            }
        });
    }

}

export default DateUtil;
