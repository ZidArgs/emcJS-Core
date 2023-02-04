export function isPropertyWritable(obj, name) {
    if (typeof obj !== "object") {
        throw new TypeError("first parameter must be an object");
    }
    if (typeof name !== "string") {
        throw new TypeError("second parameter must be a string");
    }
    const desc = Object.getOwnPropertyDescriptor(obj.constructor.prototype, name);
    return desc == null || desc.writable || desc.set != null;
}

export function isPropertyReadable(obj, name) {
    if (typeof obj !== "object") {
        throw new TypeError("first parameter must be an object");
    }
    if (typeof name !== "string") {
        throw new TypeError("second parameter must be a string");
    }
    const desc = Object.getOwnPropertyDescriptor(obj.constructor.prototype, name);
    return desc == null || desc.readable || desc.get != null;
}
