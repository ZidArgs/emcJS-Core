import {crc32} from "../CRC32.js";
import {dateTimeFromDOS} from "../date/DOSDateConverter.js";
import {setToObjectAtPath} from "../helper/collection/ObjectContent.js";
import {readStringFromDataView} from "../helper/DataView.js";
import {
    bufferToStream, streamToBlob
} from "../helper/Stream.js";

// local file header
const SIG_FILE = 0x04034b50;
// central directory file header
const SIG_CDFH = 0x02014b50;
//end of central directory record
const SIG_EOCD = 0x06054b50;

// const ATTR_DIR = 0x0010;
const ATTR_FILE = 0x0020;

export async function extractArchive(archive) {
    const {files} = archive;
    const result = {};
    for (const [fileName, fileEntry] of files) {
        if (fileEntry.isFile) {
            const content = await fileEntry.extract();
            const path = fileName.split("/").filter((c) => typeof c === "string" && c !== "");
            const fileOpts = {lastModified: fileEntry.lastModified};
            const file = new File([content], fileName, fileOpts);
            const crc = crc32(await file.text());
            if (crc !== fileEntry.crc) {
            // TODO strict error?
                console.error(`CRC mismatch for file: ${fileName} [calculated: ${crc} | expected: ${fileEntry.crc}]`);
            }
            setToObjectAtPath(result, path, file);
        }
    }
    return result;
}

export function prepareArchive(arrayBuffer) {
    const dataView = new DataView(arrayBuffer);
    let currentIndex = 0;
    const localFileHeaders = new Map();
    const files = new Map();
    const centralDirectoryFileHeaders = new Map();
    let endOfCentralDirectory;

    while (!endOfCentralDirectory) {
        const signature = dataView.getUint32(currentIndex, true);
        if (signature === SIG_FILE) {
            const entry = readLocalFileHeader(dataView, currentIndex);
            entry.startsAt = currentIndex + entry.headerSize;
            localFileHeaders.set(entry.fileName, entry);
            files.set(entry.fileName, {
                fileName: entry.fileName,
                lastModified: entry.lastModified,
                extract: inflateEntry.bind(this, dataView, {
                    startsAt: entry.startsAt,
                    compressedSize: entry.compressedSize,
                    compressionMethod: entry.compressionMethod
                }),
                uncompressedSize: entry.uncompressedSize,
                crc: entry.crc
            });
            currentIndex += entry.headerSize + entry.compressedSize;
        } else if (signature === SIG_CDFH) {
            const entry = readCentralDirectoryFileHeader(dataView, currentIndex);
            centralDirectoryFileHeaders.set(entry.fileName, entry);
            const file = files.get(entry.fileName);
            if (file) {
                file.isFile = entry.externalAttributes === ATTR_FILE;
            }
            const headerSize = 46 + entry.fileNameLength + entry.extraLength + entry.fileCommentLength;
            currentIndex += headerSize;
        } else if (signature === SIG_EOCD) {
            endOfCentralDirectory = readEndOfCentralDirectory(dataView, currentIndex);
        } else {
            console.warn(`unknown signature: 0x${signature.toString(16)}`);
            break;
        }
    }

    return {
        files,
        localFileHeaders,
        centralDirectoryFileHeaders,
        endOfCentralDirectory
    };
}

async function inflateEntry(dataView, entry) {
    const buffer = dataView.buffer.slice(entry.startsAt, entry.startsAt + entry.compressedSize);

    if (entry.compressionMethod === 0x00) {
        return new Blob([buffer]);
    } else if (entry.compressionMethod === 0x08) {
        const decompressionStream = new DecompressionStream("deflate-raw");
        const stream = bufferToStream(buffer);
        const readable = stream.pipeThrough(decompressionStream);
        return await streamToBlob(readable);
    }
}

function readLocalFileHeader(dataView, offset) {
    const fileNameLength = dataView.getUint16(offset + 26, true);
    const extraLength = dataView.getUint16(offset + 28, true);
    const lastModifiedTime = dataView.getUint16(offset + 10, true);
    const lastModifiedDate = dataView.getUint16(offset + 12, true);

    const entry = {
        signature: readStringFromDataView(dataView, offset, 4),
        version: dataView.getUint16(offset + 4, true),
        generalPurpose: dataView.getUint16(offset + 6, true),
        compressionMethod: dataView.getUint16(offset + 8, true),
        lastModified: dateTimeFromDOS(lastModifiedDate << 16 | lastModifiedTime),
        crc: dataView.getUint32(offset + 14, true),
        compressedSize: dataView.getUint32(offset + 18, true),
        uncompressedSize: dataView.getUint32(offset + 22, true),
        fileNameLength,
        fileName: readStringFromDataView(dataView, offset + 30, fileNameLength),
        extraLength,
        extra: readStringFromDataView(dataView, offset + 30 + fileNameLength, extraLength),
        headerSize: 30 + fileNameLength + extraLength
    };

    return entry;
}

function readCentralDirectoryFileHeader(dataView, offset) {
    const fileNameLength = dataView.getUint16(offset + 28, true);
    const extraLength = dataView.getUint16(offset + 30, true);
    const fileCommentLength = dataView.getUint16(offset + 32, true);
    const lastModifiedTime = dataView.getUint16(offset + 12, true);
    const lastModifiedDate = dataView.getUint16(offset + 14, true);

    const centralDirectory = {
        signature: readStringFromDataView(dataView, offset, 4),
        versionCreated: dataView.getUint16(offset + 4, true),
        versionNeeded: dataView.getUint16(offset + 6, true),
        generalPurpose: dataView.getUint16(offset + 8, true),
        compressionMethod: dataView.getUint16(offset + 10, true),
        lastModified: dateTimeFromDOS(lastModifiedDate << 16 | lastModifiedTime),
        crc: dataView.getUint32(offset + 16, true),
        compressedSize: dataView.getUint32(offset + 20, true),
        uncompressedSize: dataView.getUint32(offset + 24, true),
        fileNameLength,
        extraLength,
        fileCommentLength,
        diskNumber: dataView.getUint16(offset + 34, true),
        internalAttributes: dataView.getUint16(offset + 36, true),
        externalAttributes: dataView.getUint32(offset + 38, true),
        offset: dataView.getUint32(42, true),
        fileName: readStringFromDataView(dataView, offset + 46, fileNameLength),
        extra: readStringFromDataView(dataView, offset + 46 + fileNameLength, extraLength),
        comments: readStringFromDataView(dataView, offset + 46 + fileNameLength + extraLength, fileCommentLength)
    };

    return centralDirectory;
}

function readEndOfCentralDirectory(dataView, offset) {
    const commentLength = dataView.getUint16(offset + 20, true);

    const endOfDirectory = {
        signature: readStringFromDataView(dataView, offset, 4),
        numberOfDisks: dataView.getUint16(offset + 4, true),
        centralDirectoryStartDisk: dataView.getUint16(offset + 6, true),
        numberCentralDirectoryRecordsOnThisDisk: dataView.getUint16(offset + 8, true),
        numberCentralDirectoryRecords: dataView.getUint16(offset + 10, true),
        centralDirectorySize: dataView.getUint32(offset + 12, true),
        centralDirectoryOffset: dataView.getUint32(offset + 16, true),
        commentLength: commentLength,
        comment: readStringFromDataView(dataView, offset + 22, commentLength)
    };

    return endOfDirectory;
}
