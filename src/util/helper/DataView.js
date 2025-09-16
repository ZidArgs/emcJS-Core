export function writeStringToDataView(dataView, offset, str) {
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        dataView.setUint8(offset + i, char);
    }
}

export function readStringFromDataView(dataView, offset, length) {
    const str = [];
    for (let i = 0; i < length; i++) {
        str.push(String.fromCharCode(dataView.getUint8(offset + i)));
    }
    return str.join("");
}
