// Origin Private File System

const rootDirHandle = await navigator.storage.getDirectory();

async function createNamespace(name) {
    if (typeof name !== "string" || !name.test(/[a-z0-9]+/i)) {
        throw new TypeError("Failed to create namespace: Name is not allowed.");
    }
    return await rootDirHandle.getDirectoryHandle(name, {create: true});
}

export async function writeData(namespace, filename, data) {
    const namespaceHandle = await createNamespace(name);
    try {
        const fileHandle = await namespaceHandle.getFileHandle(filename + ".json", {create: true});
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data));
        await writable.close();
    } catch {
        // ignore
    }
}

export async function readData(namespace, filename) {
    const namespaceHandle = await createNamespace(name);
    try {
        const fileHandle = await namespaceHandle.getFileHandle(filename + ".json");
        const file = await fileHandle.getFile();
        const data = await file.text();
        return JSON.parse(data);
    } catch {
        // ignore
    }
}

export async function removeData(namespace, filename) {
    try {
        const namespaceHandle = await rootDirHandle.getDirectoryHandle(name);
        await namespaceHandle.removeEntry(filename + ".json");
    } catch {
        // ignore
    }
}

export async function getDirectoryContents(directoryHandle) {
    directoryHandle = directoryHandle || rootDirHandle;
    const result = {};
    const entries = await directoryHandle.values();
    for await (const entry of entries) {
        if (entry.kind === "directory") {
            result[entry.name] = await getDirectoryContents(entry);
        } else {
            result[entry.name] = true;
        }
    }
    return result;
}
