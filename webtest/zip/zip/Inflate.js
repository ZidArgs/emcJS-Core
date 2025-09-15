
import DOSDateConverter from "/emcJS/util/date/DOSDateConverter.js";
import {
    bufferToStream, streamToBlob, readString
} from "../utils.js";

class Inflate {

    async extractArchive(arrayBuffer) {
        const dataView = new DataView(arrayBuffer);
        let currentIndex = 0;
        const files = new Map();
        const centralDirectories = new Map();
        let endOfCentralDirectory;

        while (!endOfCentralDirectory) {
            const signature = dataView.getUint32(currentIndex, true);
            if (signature === 0x04034b50) { //local file
                const entry = this.#readLocalFile(dataView, currentIndex);
                entry.startsAt = currentIndex + 30 + entry.fileNameLength + entry.extraLength;
                entry.content = await this.#inflateEntry(dataView, entry);
                files.set(entry.fileName, entry);
                currentIndex = entry.startsAt + entry.compressedSize;
            } else if (signature === 0x02014b50) { //central directory
                const entry = this.#readCentralDirectory(dataView, currentIndex);
                centralDirectories.set(entry.fileName, entry);
                currentIndex += 46 + entry.fileNameLength + entry.extraLength + entry.fileCommentLength;
            } else if (signature === 0x06054b50) { //end of central directory
                endOfCentralDirectory = this.#readEndCentralDirectory(dataView, currentIndex);
            } else {
                console.warn(`unknown signature: 0x${signature.toString(16)}`);
                break;
            }
        }

        return {
            files,
            centralDirectories,
            endOfCentralDirectory
        };
    }

    #readLocalFile(dataView, offset) {
        const fileNameLength = dataView.getUint16(offset + 26, true);
        const extraLength = dataView.getUint16(offset + 28, true);
        const lastModifiedTime = dataView.getUint16(offset + 10, true);
        const lastModifiedDate = dataView.getUint16(offset + 12, true);

        const entry = {
            signature: readString(dataView, offset, 4),
            version: dataView.getUint16(offset + 4, true),
            generalPurpose: dataView.getUint16(offset + 6, true),
            compressionMethod: dataView.getUint16(offset + 8, true),
            lastModifiedTime,
            lastModifiedDate,
            lastModified: DOSDateConverter.dateTimeFromDOS(lastModifiedDate << 16 | lastModifiedTime),
            crc: dataView.getUint32(offset + 14, true),
            compressedSize: dataView.getUint32(offset + 18, true),
            uncompressedSize: dataView.getUint32(offset + 22, true),
            fileNameLength,
            fileName: readString(dataView, offset + 30, fileNameLength),
            extraLength,
            extra: readString(dataView, offset + 30 + fileNameLength, extraLength)
        };

        return entry;
    }

    #readCentralDirectory(dataView, offset) {
        const fileNameLength = dataView.getUint16(offset + 28, true);
        const extraLength = dataView.getUint16(offset + 30, true);
        const fileCommentLength = dataView.getUint16(offset + 32, true);
        const lastModifiedTime = dataView.getUint16(offset + 12, true);
        const lastModifiedDate = dataView.getUint16(offset + 14, true);

        const centralDirectory = {
            signature: readString(dataView, offset, 4),
            versionCreated: dataView.getUint16(offset + 4, true),
            versionNeeded: dataView.getUint16(offset + 6, true),
            generalPurpose: dataView.getUint16(offset + 8, true),
            compressionMethod: dataView.getUint16(offset + 10, true),
            lastModifiedTime,
            lastModifiedDate,
            lastModified: DOSDateConverter.dateTimeFromDOS(lastModifiedDate << 16 | lastModifiedTime),
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
            fileName: readString(dataView, offset + 46, fileNameLength),
            extra: readString(dataView, offset + 46 + fileNameLength, extraLength),
            comments: readString(dataView, offset + 46 + fileNameLength + extraLength, fileCommentLength)
        };

        return centralDirectory;
    }

    #readEndCentralDirectory(dataView, offset) {
        const commentLength = dataView.getUint16(offset + 20, true);

        const endOfDirectory = {
            signature: readString(dataView, offset, 4),
            numberOfDisks: dataView.getUint16(offset + 4, true),
            centralDirectoryStartDisk: dataView.getUint16(offset + 6, true),
            numberCentralDirectoryRecordsOnThisDisk: dataView.getUint16(offset + 8, true),
            numberCentralDirectoryRecords: dataView.getUint16(offset + 10, true),
            centralDirectorySize: dataView.getUint32(offset + 12, true),
            centralDirectoryOffset: dataView.getUint32(offset + 16, true),
            commentLength: commentLength,
            comment: readString(dataView, offset + 22, commentLength)
        };

        return endOfDirectory;
    }

    async #inflateEntry(dataView, entry) {
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

}

export default new Inflate();
