export default class AbstractLogger {

    constructor() {
        if (new.target === AbstractLogger) {
            throw new Error("can not construct abstract class");
        }
    }

    assert() {
    // to implement
    }

    clear() {
    // to implement
    }

    count() {
    // to implement
    }

    countReset() {
    // to implement
    }

    debug() {
    // to implement
    }

    dir() {
    // to implement
    }

    dirxml() {
    // to implement
    }

    table() {
    // to implement
    }

    trace() {
    // to implement
    }

    error() {
    // to implement
    }

    warn() {
    // to implement
    }

    info() {
    // to implement
    }

    log() {
    // to implement
    }

    time() {
    // to implement
    }

    timeLog() {
    // to implement
    }

    timeEnd() {
    // to implement
    }

    group() {
    // to implement
    }

    groupCollapsed() {
    // to implement
    }

    groupEnd() {
    // to implement
    }

}
