
import {crc32} from "../CRC32.js";
import {
    dateToDOS, timeToDOS
} from "../date/DOSDateConverter.js";
import {writeStringToDataView} from "../helper/DataView.js";
import {streamToBlob} from "../helper/Stream.js";

// local file header
const SIG_FILE = 0x04034b50;
// central directory file header
const SIG_CDFH = 0x02014b50;
//end of central directory record
const SIG_EOCD = 0x06054b50;

const VERSION_NOW = 63;
const VERSION_MIN = 20;

// const ATTR_DIR = 0x0010;
const ATTR_FILE = 0x0020;

export async function createArchive(files = []) {
    const blobData = [];

    const localFileEntries = [];
    const centralDirectoryFileHeaders = [];

    let offset = 0;

    for (const file of files) {
        const entry = await createLocalFileEntry(file, offset);
        offset += entry.header.byteLength + entry.compressedSize;
        localFileEntries.push(entry);

        blobData.push(entry.header);
        blobData.push(entry.compressedData);
    }

    for (const localFileEntry of localFileEntries) {
        const entry = createCentralDirectoryFileHeader(localFileEntry);
        centralDirectoryFileHeaders.push(entry);

        blobData.push(entry);
    }

    const eocdEntry = createEndOfCentralDirectory(centralDirectoryFileHeaders, offset);
    blobData.push(eocdEntry);

    return new Blob(blobData);
}

async function createLocalFileEntry(file, fileHeaderOffset) {
    const fileContents = await file.text();
    const rawStream = file.stream();
    const compressionStream = new CompressionStream("deflate-raw");
    const compressedStream = rawStream.pipeThrough(compressionStream);
    const bufferBlob = await streamToBlob(compressedStream);
    const compressedData = await bufferBlob.arrayBuffer();

    const lastModified = new Date(file.lastModified);

    const entry = {
        generalPurpose: 0,
        compressionMethod: 0x08,
        lastModifiedTime: timeToDOS(lastModified),
        lastModifiedDate: dateToDOS(lastModified),
        crc: crc32(fileContents),
        compressedSize: compressedData.byteLength,
        uncompressedSize: fileContents.length,
        fileNameLength: file.name.length,
        extraLength: 0,
        fileName: file.name,
        extra: "",
        fileHeaderOffset,
        compressedData
    };

    const headerBuffer = new ArrayBuffer(30 + entry.fileNameLength + entry.extraLength);
    const dataView = new DataView(headerBuffer);

    // Magic number
    dataView.setUint32(0, SIG_FILE, true);
    // Version needed to extract (minimum)
    dataView.setUint16(4, VERSION_MIN, true);
    // General purpose bit flag
    dataView.setUint16(6, entry.generalPurpose, true);
    // Compression method; e.g. none = 0, DEFLATE = 8 (or "\0x08\0x00")
    dataView.setUint16(8, entry.compressionMethod, true);
    // File last modification time
    dataView.setUint16(10, entry.lastModifiedTime, true);
    // File last modification date
    dataView.setUint16(12, entry.lastModifiedDate, true);
    // CRC-32 of uncompressed data
    dataView.setUint32(14, entry.crc, true);
    // Compressed size
    dataView.setUint32(18, entry.compressedSize, true);
    // Uncompressed size
    dataView.setUint32(22, entry.uncompressedSize, true);
    // File name length
    dataView.setUint16(26, entry.fileNameLength, true);
    // Extra field length
    dataView.setUint16(28, entry.extraLength, true);
    // File name
    writeStringToDataView(dataView, 30, entry.fileName);
    // Extra field
    writeStringToDataView(dataView, 30 + entry.fileNameLength, entry.extra);

    entry.header = headerBuffer;

    return entry;
}

function createCentralDirectoryFileHeader(fileEntry) {
    const {
        generalPurpose,
        compressionMethod,
        lastModifiedTime,
        lastModifiedDate,
        crc,
        compressedSize,
        uncompressedSize,
        fileNameLength,
        extraLength,
        fileName,
        extra,
        fileHeaderOffset
    } = fileEntry;

    const fileCommentLength = 0;
    const fileComment = "";
    const diskNumber = 0;
    const internalAttributes = 0;
    const externalAttributes = ATTR_FILE;

    const headerBuffer = new ArrayBuffer(46 + fileNameLength + extraLength + fileCommentLength);
    const dataView = new DataView(headerBuffer);

    // Magic number
    dataView.setUint32(0, SIG_CDFH, true);
    // Version made by
    dataView.setUint16(4, VERSION_NOW, true);
    // Version needed to extract (minimum)
    dataView.setUint16(6, VERSION_MIN, true);
    // General purpose bit flag
    dataView.setUint16(8, generalPurpose, true);
    // Compression method
    dataView.setUint16(10, compressionMethod, true);
    // File last modification time
    dataView.setUint16(12, lastModifiedTime, true);
    // File last modification date
    dataView.setUint16(14, lastModifiedDate, true);
    // CRC-32 of uncompressed data
    dataView.setUint32(16, crc, true);
    // Compressed size
    dataView.setUint32(20, compressedSize, true);
    // Uncompressed size
    dataView.setUint32(24, uncompressedSize, true);
    // File name length
    dataView.setUint16(28, fileNameLength, true);
    // Extra field length
    dataView.setUint16(30, extraLength, true);
    // File comment length
    dataView.setUint16(32, fileCommentLength, true);
    // Disk number where file starts
    dataView.setUint16(34, diskNumber, true);
    // Internal file attributes
    dataView.setUint16(36, internalAttributes, true);
    // External file attributes
    dataView.setUint32(38, externalAttributes, true);
    // Relative offset of local file header
    dataView.setUint32(42, fileHeaderOffset, true);
    // File name
    writeStringToDataView(dataView, 46, fileName);
    // Extra field
    writeStringToDataView(dataView, 46 + fileNameLength, extra);
    // File comment
    writeStringToDataView(dataView, 46 + fileNameLength + extraLength, fileComment);

    return headerBuffer;
}

function createEndOfCentralDirectory(centralDirectories, centralDirectoryOffset) {
    const numberOfDisks = 0;
    const centralDirectoryStartDisk = 0;
    const numberCentralDirectoryRecordsOnThisDisk = centralDirectories.length;
    const numberCentralDirectoryRecords = centralDirectories.length;
    const commentLength = 0;
    const comment = "";

    let centralDirectorySize = 0;
    for (const centralDirectory of centralDirectories) {
        centralDirectorySize += centralDirectory.byteLength;
    }

    const headerBuffer = new ArrayBuffer(22 + commentLength);
    const dataView = new DataView(headerBuffer);

    // Magic number
    dataView.setUint32(0, SIG_EOCD, true);
    // Number of this disk
    dataView.setUint16(4, numberOfDisks, true);
    // Disk where central directory starts
    dataView.setUint16(6, centralDirectoryStartDisk, true);
    // Number of central directory records on this disk
    dataView.setUint16(8, numberCentralDirectoryRecordsOnThisDisk, true);
    // Total number of central directory records
    dataView.setUint16(10, numberCentralDirectoryRecords, true);
    // Size of central directory in bytes
    dataView.setUint32(12, centralDirectorySize, true);
    // Offset of start of central directory, relative to start of archive
    dataView.setUint32(16, centralDirectoryOffset, true);
    // Comment length
    dataView.setUint16(20, commentLength, true);
    // Comment
    writeStringToDataView(dataView, 22, comment);

    return headerBuffer;
}
