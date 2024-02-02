export function sleep(ms = 0) {
    ms = parseInt(ms);
    if (isNaN(ms) || ms < 0) {
        ms = 0;
    }
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
}
