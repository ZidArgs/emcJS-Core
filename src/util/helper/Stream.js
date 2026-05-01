export function bufferToStream(arrayBuffer) {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(arrayBuffer);
            controller.close();
        }
    });
}

export async function streamToBlob(stream, type) {
    if (!(stream instanceof ReadableStream)) {
        throw new TypeError("stream must be an instance of ReadableStream");
    }
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
