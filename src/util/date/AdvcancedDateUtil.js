
const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_NAMES_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const FORMAT_FN = {
    // Day
    d: (date) => `0${date.getDate()}`.slice(-2),
    D: (date) => DAY_NAMES_SHORT[date.getDay()],
    j: (date) => date.getDate(),
    l: (date) => DAY_NAMES_FULL[date.getDay()],
    N: (date) => date.getDay() + 1,
    S: (date) => {
        switch (date.getDate()) {
            case 1:
            case 21:
            case 31: {
                return "st";
            }
            case 2:
            case 22: {
                return "nd";
            }
            case 3:
            case 23: {
                return "rd";
            }
            default: {
                return "th";
            }
        }
    },
    w: (date) => date.getDay(),
    z: () => {
        throw new Error("day of the year (z) is not supported yet")
    }, // 0 - 365
    // Week
    W: () => {
        throw new Error("week of the year (W) is not supported yet")
    }, // eg: 24 for the 42nd week
    // Month
    F: (date) => MONTH_NAMES_FULL[date.getMonth()],
    m: (date) => `0${date.getMonth() + 1}`.slice(-2),
    M: (date) => MONTH_NAMES_SHORT[date.getMonth()],
    n: (date) => date.getMonth() + 1,
    t: () => {
        throw new Error("number of days in a month (t) is not supported yet")
    }, // 28 - 31
    // Year
    L: () => {
        throw new Error("leap year (L) is not supported yet")
    }, // 1 for leap, 0 otherwise
    Y: (date) => date.getFullYear(),
    y: (date) => `${date.getFullYear()}`.slice(-2),
    // Time
    a: (date) => date.getHours() > 11 ? "pm" : "am",
    A: (date) => date.getHours() > 11 ? "PM" : "AM",
    g: (date) => {
        const h = date.getHours();
        return h > 12 ? h - 12 : h;
    },
    G: (date) => date.getHours(),
    h: (date) => {
        const h = date.getHours();
        return `0${h > 12 ? h - 12 : h}`.slice(-2);
    },
    H: (date) => `0${date.getHours()}`.slice(-2),
    i: (date) => `0${date.getMinutes()}`.slice(-2),
    s: (date) => `0${date.getSeconds()}`.slice(-2),
    v: (date) => `00${date.getMilliseconds()}`.slice(-3),
    // Timezone
    e: () => {
        throw new Error("timezone identifier (e) is not supported yet")
    }, // eg: UTC, GMT, Atlantic/Azores
    I: () => {
        throw new Error("daylight savings (I) is not supported yet")
    }, // 1 for daylight savings, 0 otherwise
    O: (date) => {
        const o = date.getTimezoneOffset();
        const n = o < 0;
        const d = n ? -o : o
        const h = `0${Math.floor(d / 60)}`.slice(-2);
        const m = `0${d % 60}`.slice(-2);
        return `${n ? "-" : "+"}${h}${m}`;
    },
    P: (date) => {
        const o = date.getTimezoneOffset();
        const n = o < 0;
        const d = n ? -o : o
        const h = `0${Math.floor(d / 60)}`.slice(-2);
        const m = `0${d % 60}`.slice(-2);
        return `${n ? "-" : "+"}${h}:${m}`;
    }
};

const REG_EXP = /[dDjlNSwzWfmMntLYyaAgGhHisveIOP]/g;

// TODO documentation
export default class AdvcancedDateUtil {

    format(date, format) {
        return format.replace(REG_EXP, (m) => FORMAT_FN[m](date));
    }

    getISOString(date) {
        return `${FORMAT_FN["Y"](date)}-${FORMAT_FN["m"](date)}-${FORMAT_FN["d"](date)}T${FORMAT_FN["H"](date)}:${FORMAT_FN["i"](date)}:${FORMAT_FN["s"](date)}${FORMAT_FN["O"](date)}`;
    }

}
