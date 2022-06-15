import fs from "fs";
import path from "path";
import {
    Transform
} from "stream";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g;
const CHECKS = [
    /* native static import */
    /^\s*import(?:\s+[a-zA-Z0-9_${}, ]+\s+from)?\s+"([^"]+)"\s*;?$/,
    /* native static import - named with newline */
    /^\}\s+from\s+"([^"]+)"\s*;?$/,
    /* native dynamic import */
    /^(?:.*\s)?import\s*\(\s*"([^"]+)"s*\)/,
    /* custom module import */
    /^(?:.*\s)?Import\.module\s*\(\s*"([^"]+)"s*\)/,
    /* custom module injection */
    /^(?:.*\s)?Inject\.module\s*\(\s*"([^"]+)"s*\)/,
    /* custom script injection */
    /^(?:.*\s)?Inject\.script\s*\(\s*"([^"]+)"s*\)/
];

function normalizePath(path) {
    return path.replace(/\\/g, "/");
}

const allImports = new Map();

function analyzeFile(sourcePath, src = "/", dest = "/", target = "/", fileContent = "") {
    const sourceDir = path.dirname(sourcePath);
    const lines = fileContent.split(LNBR_SEQ);
    const usedImports = new Set();
    for (const line of lines) {
        for (const regExp of CHECKS) {
            const result = regExp.exec(line);
            if (result != null) {
                const filePath = result[1];
                if (filePath.startsWith("/")) {
                    const resolvedPath = normalizePath(path.resolve(target, filePath.slice(1)));
                    usedImports.add(resolvedPath);
                } else {
                    const fullPath = path.resolve(sourceDir, filePath);
                    const resolvedPath = normalizePath(path.resolve(dest, path.relative(src, fullPath)));
                    usedImports.add(resolvedPath);
                }
                break;
            }
        }
    }
    const resolvedPath = normalizePath(path.resolve(dest, path.relative(src, sourcePath)));
    allImports.set(resolvedPath, usedImports);
}

class ImportAnalyzer {

    register(src, dest, target) {
        const transformStream = new Transform({objectMode: true});
        transformStream._transform = function(file, encoding, callback) {
            analyzeFile(file.path, src, dest, target, String(file.contents));
            callback(null, file);
        };
        return transformStream;
    }

    #calculateUsedImports(...filePaths) {
        const result = new Set();
        for (const currentFilePath of filePaths) {
            const normalizedFilePath = normalizePath(currentFilePath);
            const usedImports = allImports.get(normalizedFilePath);
            if (usedImports != null) {
                result.add(normalizedFilePath);
                for (const filePath of usedImports) {
                    if (!result.has(filePath)) {
                        const used = this.#calculateUsedImports(filePath);
                        for (const imp of used) {
                            result.add(imp);
                        }
                    }
                }
            }
        }
        return result;
    }

    getUsedImports(...filePaths) {
        // print
        const importTree = {};
        for (const [file, imports] of allImports) {
            importTree[file] = Array.from(imports);
        }
        fs.writeFileSync(path.resolve("import_tree.json"), JSON.stringify(importTree, null, 4));
        // calculate
        const result = this.#calculateUsedImports(...filePaths);
        if (result.size) {
            return result;
        }
    }

}

export default new ImportAnalyzer();
