
/* LOG LEVEL */
const LEVEL = Object.freeze({
    SEVERE: "SEVERE",
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    LOG: "LOG"
});

/* LEVEL COLORS HTML */
const HTML_DEFAULT_STYLES = {};
HTML_DEFAULT_STYLES[LEVEL.SEVERE] = {
    "background": "#860000",
    "color": "#ffffff"
};
HTML_DEFAULT_STYLES[LEVEL.ERROR] = {
    "background": "#222222",
    "color": "#ff3e3e"
};
HTML_DEFAULT_STYLES[LEVEL.WARN] = {
    "background": "#222222",
    "color": "#ffff00"
};
HTML_DEFAULT_STYLES[LEVEL.INFO] = {
    "background": "#222222",
    "color": "#00ceff"
};
HTML_DEFAULT_STYLES[LEVEL.LOG] = {
    "background": "#222222",
    "color": "#00ff00"
};
const HTML_DEFAULT_UNSET = {
    "background": "#222222",
    "color": "#dddddd"
};

/* LEVEL COLORS CONSOLE */
const CONSOLE_DEFAULT_STYLES = {};
CONSOLE_DEFAULT_STYLES[LEVEL.SEVERE] = "background:#860000;color:#ffffff;";
CONSOLE_DEFAULT_STYLES[LEVEL.ERROR] = "background:#ffffff;color:#ff0000;";
CONSOLE_DEFAULT_STYLES[LEVEL.WARN] = "background:#ffffff;color:#dd5500;";
CONSOLE_DEFAULT_STYLES[LEVEL.INFO] = "background:#ffffff;color:#0000ff;";
CONSOLE_DEFAULT_STYLES[LEVEL.LOG] = "background:#ffffff;color:#008800;";
const CONSOLE_DEFAULT_UNSET = "background:#ffffff;color:#333333;";

// TODO add function to set colors per output

const TIME_FND = /(....)-(..)-(..)T(..:..:..\....)Z/;
const TIME_REP = "$3.$2.$1-$4";

const output = new Set;
const level = new Set(["ERROR", "WARN", "INFO", "LOG"]);

function write(data) {
    if (!!output.size && level.has(data.type)) {
        let msg;
        if (data.message instanceof Error) {
            msg = `[ ${data.type} | ${data.time} ] <${data.target}> ${data.message.message}\n${data.message.stack}`;
        } else {
            msg = `[ ${data.type} | ${data.time} ] <${data.target}>\n${data.message}`;
        }
        Array.from(output).forEach(function(out) {
            if (out instanceof HTMLTextAreaElement) {
                out.value += msg + "\n";
                out.scrollTop = out.scrollHeight;
            } else if (out instanceof HTMLElement) {
                const el = document.createElement("span");
                el.setAttribute("log-type", data.type);
                if (HTML_DEFAULT_STYLES[data.type] != null) {
                    for (const i in HTML_DEFAULT_STYLES[data.type]) {
                        el.style[i] = HTML_DEFAULT_STYLES[data.type][i];
                    }
                } else {
                    for (const i in HTML_DEFAULT_UNSET) {
                        el.style[i] = HTML_DEFAULT_UNSET[i];
                    }
                }
                el.append(document.createTextNode(msg));
                out.append(el);
                out.scrollTop = out.scrollHeight;
            } else if (output === console) {
                console.log("%c%s%c", CONSOLE_DEFAULT_STYLES[data.type] || CONSOLE_DEFAULT_UNSET, msg, "");
            }
        });
    }
}

window.addEventListener("error", function(msg, url, line, col, error) {
    if (msg instanceof ErrorEvent) {
        write({
            target: `${msg.filename ? msg.filename : "anonymous"} ${msg.lineno}:${msg.colno}`,
            type: LEVEL.SEVERE,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: msg.error ? msg.error : msg.message
        });
    } else {
        col = col ? `:${col}` : "";
        error = error ? `\n${error}` : "";
        write({
            target: `${url} ${line}${col}`,
            type: LEVEL.SEVERE,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: `${msg}${error}`
        });
    }
    return true;
});

// TODO add instances for specific logging
// possibly easier achieved using private members

export default class Logger {

    static get LEVEL() {
        return LEVEL;
    }

    static error(message, target = null) {
        write({
            target: target,
            type: LEVEL.ERROR,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static warn(message, target = null) {
        write({
            target: target,
            type: LEVEL.WARN,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static info(message, target = null) {
        write({
            target: target,
            type: LEVEL.INFO,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static log(message, target = null) {
        write({
            target: target,
            type: LEVEL.LOG,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static message(type, message, target = null) {
        write({
            target: target,
            type: type,
            time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
            message: message
        });
    }

    static addLevel(value) {
        level.add(value);
    }

    static removeLevel(value) {
        level.delete(value);
    }

    static addOutput(value) {
        output.add(value);
    }

    static removeOutput(value) {
        output.delete(value);
    }

}
