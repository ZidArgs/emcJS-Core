export function bufferToStream(arrayBuffer) {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(arrayBuffer);
            controller.close();
        }
    });
}

export async function streamToBlob(stream, type) {
    const reader = stream.getReader();
    let done = false;
    const data = [];

    while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
            data.push(result.value);
        }
    }

    return new Blob(data, {type});
}

export function readString(dataView, offset, length) {
    const str = [];
    for (let i = 0; i < length; i++) {
        str.push(String.fromCharCode(dataView.getUint8(offset + i)));
    }
    return str.join("");
}
