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
    const fn = function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            try {
                func(...args);
            } finally {
                timeout = null;
            }
        }, wait);
    };
    fn.cancel = () => {
        clearTimeout(timeout);
        timeout = null;
    };
    return fn;
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
    const fn = function(...data) {
        cache.push(data);
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            try {
                const params = cache;
                cache = [];
                func(params);
            } finally {
                timeout = null;
            }
        }, wait);
    };
    fn.cancel = () => {
        clearTimeout(timeout);
        timeout = null;
        cache = [];
    };
    return fn;
}

export function debounceByType(func, wait = 0) {
    if (typeof func != "function") {
        throw new TypeError(`func parameter must be of type "function" but was "${typeof ref}"`);
    }
    if (typeof wait != "number") {
        throw new TypeError(`wait parameter must be of type "number" but was "${typeof ref}"`);
    }
    if (isNaN(wait) || wait < 0) {
        wait = 0;
    }
    const timeout = new Map();
    const fn = function(type, ...args) {
        clearTimeout(timeout.get(type));
        timeout.set(type, setTimeout(() => {
            try {
                func(type, ...args);
            } finally {
                timeout.set(type, null);
            }
        }, wait));
    };
    fn.cancel = (type) => {
        clearTimeout(timeout.get(type));
        timeout.set(type, null);
    };
    return fn;
}
