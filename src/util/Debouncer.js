export function debounce(func, wait = 0) {
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
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    };
}

export function debounceCacheData(func, wait = 0) {
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
    let cache = [];
    return function(data) {
        cache.push(data);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func(cache);
            cache = [];
        }, wait);
    };
}
