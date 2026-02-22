import {isClass} from "../helper/Class.js";
import Rest from "../net/Rest.js";

/* LOG LEVEL */
export const LOG_LEVEL = Object.freeze({
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    LOG: "LOG"
});

/* LEVEL COLORS */
const DEFAULT_STYLES = {};
DEFAULT_STYLES[LOG_LEVEL.ERROR] = {"color": "#F59476"};
DEFAULT_STYLES[LOG_LEVEL.WARN] = {"color": "#F5D753"};
DEFAULT_STYLES[LOG_LEVEL.INFO] = {"color": "#84CFE6"};
DEFAULT_STYLES[LOG_LEVEL.LOG] = {"color": "#83EB9E"};
const DEFAULT_UNSET_STYLE = {"color": "#B8B8B8"};

const TIME_FND = /(....)-(..)-(..)T(..:..:..\....)Z/;
const TIME_REP = "$1-$2-$3 $4";

let reportWindowErrorEvents = false;
const writeTargets = new Set();
const writeLevel = new Set([
    "ERROR",
    "WARN",
    "INFO",
    "LOG"
]);
let reportTarget = null;
const reportLevel = new Set(["ERROR", "WARN"]);
let globalOmitStack = true;

function formatStyle(style) {
    const result = [];
    for (const attr in style) {
        result.push(`${attr}:${style[attr]}`);
    }
    return result.join(";");
}

function setStyle(el, style) {
    for (const i in style) {
        el.style[i] = style[i];
    }
}

function extractError(err) {
    if (err.cause != null) {
        return {
            message: err.message,
            stack: err.stack.split("\n").slice(1).join("\n"),
            cause: extractError(err.cause)
        };
    }
    return {
        message: err.message,
        stack: err.stack.split("\n").slice(1).join("\n")
    };
}

function formatMessage(data, omitStack) {
    const {
        type, time, target, message
    } = data;
    const typeString = type.padEnd(5);
    const targetString = typeof target === "string" && target !== "" ? target : "∅";
    if (message instanceof Error) {
        const msg = formatError(message, omitStack);
        return `[${time} - ${typeString}] ${targetString} • ${msg}`;
    } else {
        return `[${time} - ${typeString}] ${targetString} • ${message}`;
    }
}

function formatError(err, omitStack) {
    const msg = err.message;
    const stack = err.stack.split("\n").slice(1).join("\n");
    const cause = err.cause;
    const result = [msg];
    if ((omitStack != null && !omitStack) || !globalOmitStack) {
        result.push(stack);
    }
    if (cause != null) {
        if (Array.isArray(cause)) {
            result.push(`    ↳ ${cause.map((c) => {
                return formatError(c, omitStack).split("\n").map((l) => `    ${l}`).join("\n").slice(4);
            }).join("\n    ↳ ")}`);
        } else {
            result.push(`    ↳ ${formatError(cause, omitStack).split("\n").map((l) => `    ${l}`).join("\n").slice(4)}`);
        }
    }
    return result.join("\n");
}

export default class Logger {

    static #instances = new Map();

    #clazzName = "";

    #omitStack = true;

    constructor(clazz) {
        if (clazz != null) {
            if (clazz == null || !isClass(clazz)) {
                throw new Error("can only construct Logger for classes");
            }
        }
        if (Logger.#instances.has(clazz)) {
            return Logger.#instances.get(clazz);
        }
        this.#clazzName = clazz.name;
    }

    set omitStack(value) {
        this.#omitStack = !!value;
    }

    get omitStack() {
        return this.#omitStack;
    }

    error(message) {
        Logger.error(message, this.#clazzName, {omitStack: this.#omitStack});
    }

    warn(message) {
        Logger.warn(message, this.#clazzName, {omitStack: this.#omitStack});
    }

    info(message) {
        Logger.info(message, this.#clazzName, {omitStack: this.#omitStack});
    }

    log(message) {
        Logger.log(message, this.#clazzName, {omitStack: this.#omitStack});
    }

    message(type, message) {
        Logger.message(type, message, this.#clazzName, {omitStack: this.#omitStack});
    }

    static #write(data, omitStack) {
        if (!!writeTargets.size && writeLevel.has(data.type)) {
            const msg = formatMessage(data, omitStack);
            for (const out of writeTargets) {
                if (out instanceof HTMLTextAreaElement) {
                    out.value += msg + "\n";
                    out.scrollTop = out.scrollHeight;
                } else if (out instanceof HTMLElement) {
                    const el = document.createElement("span");
                    el.setAttribute("log-type", data.type);
                    setStyle(el, DEFAULT_STYLES[data.type] ?? DEFAULT_UNSET_STYLE);
                    el.append(document.createTextNode(msg));
                    out.append(el);
                    out.scrollTop = out.scrollHeight;
                } else if (out === console) {
                    console.log("%c%s%c", formatStyle(DEFAULT_STYLES[data.type] ?? DEFAULT_UNSET_STYLE), msg, "");
                }
            }
        }
        if (reportTarget != null && reportLevel.has(data.type)) {
            if (data.message instanceof Error) {
                Rest.post(reportTarget, {
                    ...data,
                    message: extractError(data.message)
                });
            } else {
                Rest.post(reportTarget, data);
            }
        }
    }

    static error(message, target = null, params = {}) {
        const {
            omitStack = undefined, time = new Date()
        } = params;
        this.#write({
            target: target,
            type: LOG_LEVEL.ERROR,
            time: time.toJSON().replace(TIME_FND, TIME_REP),
            message: message
        }, omitStack);
    }

    static warn(message, target = null, params = {}) {
        const {
            omitStack = undefined, time = new Date()
        } = params;
        this.#write({
            target: target,
            type: LOG_LEVEL.WARN,
            time: time.toJSON().replace(TIME_FND, TIME_REP),
            message: message
        }, omitStack);
    }

    static info(message, target = null, params = {}) {
        const {
            omitStack = undefined, time = new Date()
        } = params;
        this.#write({
            target: target,
            type: LOG_LEVEL.INFO,
            time: time.toJSON().replace(TIME_FND, TIME_REP),
            message: message
        }, omitStack);
    }

    static log(message, target = null, params = {}) {
        const {
            omitStack = undefined, time = new Date()
        } = params;
        this.#write({
            target: target,
            type: LOG_LEVEL.LOG,
            time: time.toJSON().replace(TIME_FND, TIME_REP),
            message: message
        }, omitStack);
    }

    static message(type, message, target = null, params = {}) {
        const {
            omitStack = undefined, time = new Date()
        } = params;
        this.#write({
            target: target,
            type: type,
            time: time.toJSON().replace(TIME_FND, TIME_REP),
            message: message
        }, omitStack);
    }

    static addLevel(value) {
        writeLevel.add(value);
    }

    static removeLevel(value) {
        writeLevel.delete(value);
    }

    static addOutput(value) {
        writeTargets.add(value);
    }

    static removeOutput(value) {
        writeTargets.delete(value);
    }

    static addReportLevel(value) {
        reportLevel.add(value);
    }

    static removeReportLevel(value) {
        reportLevel.delete(value);
    }

    static setReportTarget(value) {
        if (typeof value === "string" && value != "") {
            try {
                reportTarget = new URL(value);
            } catch {
                reportTarget = null;
            }
        } else {
            reportTarget = null;
        }
    }

    static set omitStack(value) {
        globalOmitStack = !!value;
    }

    static get omitStack() {
        return globalOmitStack;
    }

    static logWindowErrorEvents(value) {
        reportWindowErrorEvents = !!value;
    }

}

Logger.addOutput(console);

globalThis.Logger = Logger;

if ("addEventListener" in globalThis) {
    globalThis.addEventListener("error", function(msg, url, line, col, error) {
        if (msg instanceof ErrorEvent) {
            if (reportWindowErrorEvents) {
                Logger.error(msg.error ? msg.error : msg.message,
                    `${msg.filename ? msg.filename : "anonymous"} ${msg.lineno}:${msg.colno}`);
            }
        } else {
            col = col ? `:${col}` : "";
            error = error ? `\n${error}` : "";
            Logger.error(`${msg}${error}`,
                `${url} ${line}${col}`);
        }
        return true;
    });
}
