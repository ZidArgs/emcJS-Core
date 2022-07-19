import Helper from "../helper/Helper.js";
import Rest from "../net/Rest.js";

/* LOG LEVEL */
export const LogLevel = Object.freeze({
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    LOG: "LOG"
});

/* LEVEL COLORS */
const DEFAULT_STYLES = {};
DEFAULT_STYLES[LogLevel.ERROR] = {"color": "#F59476"};
DEFAULT_STYLES[LogLevel.WARN] = {"color": "#F5D753"};
DEFAULT_STYLES[LogLevel.INFO] = {"color": "#84CFE6"};
DEFAULT_STYLES[LogLevel.LOG] = {"color": "#83EB9E"};
const DEFAULT_UNSET_STYLE = {"color": "#B8B8B8"};

const TIME_FND = /(....)-(..)-(..)T(..:..:..\....)Z/;
const TIME_REP = "$3.$2.$1 - $4";

let reportWindowErrorEvents = false;
const writeTargets = new Set;
const writeLevel = new Set(["ERROR", "WARN", "INFO", "LOG"]);
let reportTarget = null;
const reportLevel = new Set(["ERROR", "WARN"]);

function formatStyle(style) {
    const result = [];
    for (const attr in style) {
        result.push(`${attr}:${style[attr]}`)
    }
    return result.join(";");
}

function setStyle(el, style) {
    for (const i in style) {
        el.style[i] = style[i];
    }
}

function formatError(err) {
    return {
        message: err.message,
        stack: err.stack.split("\n").slice(1).join("\n")
    };
}

function formatMessage(data) {
    const {type, time, target, message} = data;
    if (message instanceof Error) {
        const {message: msg, stack} = formatError(message);
        return `[ ${type} | ${time} ] <${target}> ${msg}\n${stack}`;
    } else {
        return `[ ${type} | ${time} ] <${target}>\n${message}`;
    }
}

export default class Logger {

    static #instances = new Map();

    #clazzName = "";

    constructor(clazz) {
        if (clazz != null) {
            if (clazz == null || !Helper.isClass(clazz)) {
                throw new Error("can only construct Logger for classes");
            }
        }
        if (Logger.#instances.has(clazz)) {
            return Logger.#instances.get(clazz);
        }
        this.#clazzName = clazz.name;
    }

    error(message) {
        Logger.error(message, this.#clazzName);
    }

    warn(message) {
        Logger.warn(message, this.#clazzName);
    }

    info(message) {
        Logger.info(message, this.#clazzName);
    }

    log(message) {
        Logger.log(message, this.#clazzName);
    }

    message(type, message) {
        Logger.message(type, message, this.#clazzName);
    }

    static #write(data) {
        if (!!writeTargets.size && writeLevel.has(data.type)) {
            const msg = formatMessage(data);
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
                    message: formatError(data.message)
                });
            } else {
                Rest.post(reportTarget, data);
            }
        }
    }

    static error(message, target = null) {
        this.#write({
            target: target,
            type: LogLevel.ERROR,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static warn(message, target = null) {
        this.#write({
            target: target,
            type: LogLevel.WARN,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static info(message, target = null) {
        this.#write({
            target: target,
            type: LogLevel.INFO,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static log(message, target = null) {
        this.#write({
            target: target,
            type: LogLevel.LOG,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static message(type, message, target = null) {
        this.#write({
            target: target,
            type: type,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
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

    static logWindowErrorEvents(value) {
        reportWindowErrorEvents = !!value;
    }

}

Logger.addOutput(console);

window.Logger = Logger;

window.addEventListener("error", function(msg, url, line, col, error) {
    if (msg instanceof ErrorEvent) {
        if (reportWindowErrorEvents) {
            Logger.error(
                msg.error ? msg.error : msg.message,
                `${msg.filename ? msg.filename : "anonymous"} ${msg.lineno}:${msg.colno}`
            );
        }
    } else {
        col = col ? `:${col}` : "";
        error = error ? `\n${error}` : "";
        Logger.error(
            `${msg}${error}`,
            `${url} ${line}${col}`
        );
    }
    return true;
});
