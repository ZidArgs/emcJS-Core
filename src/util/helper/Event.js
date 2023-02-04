const EVENT_TAGNAMES = {
    "select":"input",
    "change":"input",
    "submit":"form",
    "reset":"form",
    "error":"img",
    "load":"img",
    "abort":"img"
};

export function isEventSupported(eventName) {
    const el = document.createElement(EVENT_TAGNAMES[eventName] || "div");
    const onEventName = `on${eventName}`;
    const isSupported = onEventName in el;
    if (!isSupported) {
        el.setAttribute(onEventName, "return;");
        return typeof el[onEventName] === "function";
    }
    return isSupported;
}
