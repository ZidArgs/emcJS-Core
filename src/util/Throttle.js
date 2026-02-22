export function throttle(func, wait = 0) {
    if (typeof func != "function") {
        throw new TypeError(`func parameter must be of type "function" but was "${typeof ref}"`);
    }
    if (typeof wait != "number") {
        throw new TypeError(`wait parameter must be of type "number" but was "${typeof ref}"`);
    }
    if (isNaN(wait) || wait < 0) {
        wait = 0;
    }
    let timeout;
    const fn = function(...args) {
        if (!timeout) {
            timeout = setTimeout(() => {
                try {
                    func(...args);
                } finally {
                    timeout = null;
                }
            }, wait);
        }
    };
    fn.cancel = () => {
        clearTimeout(timeout);
        timeout = null;
    };
    return fn;
}
