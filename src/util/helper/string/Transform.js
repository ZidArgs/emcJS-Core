export function padStartSlice(str, length, fill) {
    return str.padStart(length, fill).slice(-length)
}

export function padEndSlice(str, length, fill) {
    return str.padEnd(length, fill).slice(0, length)
}
