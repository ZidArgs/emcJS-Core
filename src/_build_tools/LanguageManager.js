import fs from "fs";
import path from "path";
import through from "through";
// import del from "del";

const LNBR_SEQ = /(?:\r\n|\n|\r)/g
const EXTRACTORS = [
    {
        regEx: /@base:\s*(.+)\s*/,
        func: (result, matches) => {
            result["base"] = matches[1];
        }
    },
    {
        regEx: /@label:\s*(.+)\s*/,
        func: (result, matches) => {
            result["label"] = matches[1];
        }
    },
    {
        regEx: /@author:\s*(.+)\s*/,
        func: (result, matches) => {
            result["author"] = matches[1];
        }
    },
    {
        regEx: /#\s*fragment:\s*(.+)\.([^.]+)\s*/,
        func: (result, matches) => {
            result["fragments"] = result["fragments"] ?? [];
            result["fragments"].push({
                "type": matches[2],
                "name": matches[1]
            });
        }
    }
];
const FILES = new Map();

function normalizePath(path) {
    return path.replace(/\\/g, "/");
}

function analyzeFile(ref, file) {
    const result = {
        "label": ref
    };
    const fileContent = String(file.contents);
    const lines = fileContent.split(LNBR_SEQ);
    if (lines[0].startsWith("!language file")) {
        for (const line of lines) {
            for (const {regEx, func} of EXTRACTORS) {
                const matches = regEx.exec(line);
                if (matches != null) {
                    func(result, matches);
                    break;
                }
            }
        }
    }
    return result;
}

class LanguageManager {

    register(/* src = "/", dest = "/", sourcemaps = false */) {
        const files = [];
        return through(function(file) {
            const ref = path.basename(file.path, ".lang");
            const result = analyzeFile(ref, file);
            FILES.set(ref, result);
            this.push(file);
            return files.push(file);
        }, function() {
            return this.emit("end");
        });
    }

    finish(dest = "/", metaFile = "_meta.json") {
        const metaPath = path.resolve(dest, metaFile);
        const metaPathNormal = normalizePath(metaPath);
        console.log(`i18n meta file: ${metaPathNormal}`);
        const files = Object.fromEntries(FILES.entries());
        fs.writeFileSync(metaPath, JSON.stringify(files, null, 4));
        FILES.clear();
        return metaPath;
    }

}

export default new LanguageManager();
