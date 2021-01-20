
/* LOG LEVEL */
const LEVEL = Object.freeze({
    ERROR: "ERROR",
    WARN: "WARN",
    INFO: "INFO",
    LOG: "LOG"
});

/* LEVEL COLORS HTML */
const HTML_DEFAULT_STYLES = {};
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

// TODO add function to set colors per output

const TIME_FND = /(....)-(..)-(..)T(..:..:..\....)Z/;
const TIME_REP = "$3.$2.$1-$4";

const output = new Set;

function write(data) {
    if (output.size) {
        let msg;
        if (data.message instanceof Error) {
            msg = `${data.type} - ${data.time}\n${data.message.message}\n${data.message.stack}`;
        } else {
            msg = `${data.type} - ${data.time} ${data.message}`;
        }
        Array.from(output).forEach(function(out) {
            if (out instanceof HTMLTextAreaElement) {
                out.value += msg + "\n";
                out.scrollTop = out.scrollHeight;
            } else if (out instanceof HTMLElement) {
                const el = document.createElement("span");
                for (const i in HTML_DEFAULT_STYLES[data.type]) {
                    el.style[i] = HTML_DEFAULT_STYLES[data.type][i];
                }
                el.append(document.createTextNode(msg));
                out.append(el);
                out.scrollTop = out.scrollHeight;
            }
        });
    }
}

// TODO add instances for specific logging
// possibly easier achieved using private members

export default class LoggerRaw {

    static error(...message) {
        if (message[0] instanceof Error) {
            write({
                type: LEVEL.ERROR,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: message[0]
            });
            console.error(message[0]);
        } else {
            write({
                type: LEVEL.ERROR,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: JSON.stringify(message, null, 4)
            });
            console.error(...message);
        }
    }

    static warn(...message) {
        if (message[0] instanceof Error) {
            write({
                type: LEVEL.WARN,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: message[0]
            });
            console.error(message[0]);
        } else {
            write({
                type: LEVEL.WARN,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: JSON.stringify(message, null, 4)
            });
            console.warn(...message);
        }
    }

    static info(...message) {
        if (message[0] instanceof Error) {
            write({
                type: LEVEL.INFO,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: message[0]
            });
            console.error(message[0]);
        } else {
            write({
                type: LEVEL.INFO,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: JSON.stringify(message, null, 4)
            });
            console.info(...message);
        }
    }

    static log(...message) {
        if (message[0] instanceof Error) {
            write({
                type: LEVEL.LOG,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: message[0]
            });
            console.error(message[0]);
        } else {
            write({
                type: LEVEL.LOG,
                time: (new Date).toJSON().replace(TIME_FND, TIME_REP),
                message: JSON.stringify(message, null, 4)
            });
            console.log(...message);
        }
    }

    static addOutput(value) {
        output.add(value);
    }

    static removeOutput(value) {
        output.delete(value);
    }

}
