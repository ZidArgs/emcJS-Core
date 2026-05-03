export function writeStringToDataView(dataView, offset = 0, str = "") {
    if (!(dataView instanceof DataView)) {
        throw new TypeError("dataView must be an instance of DataView");
    }
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        dataView.setUint8(offset + i, char);
    }
}

export function readStringFromDataView(dataView, offset = 0, length = 0) {
    if (!(dataView instanceof DataView)) {
        throw new TypeError("dataView must be an instance of DataView");
    }
    const str = [];
    for (let i = 0; i < length; i++) {
        str.push(String.fromCharCode(dataView.getUint8(offset + i)));
    }
    return str.join("");
}
