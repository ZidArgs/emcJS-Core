import fs from "fs";
import path from "path";
import glob from "glob-all";
import through from "through";
import del from "del";

const FILES = new Set();

function normalizePath(path) {
    return path.replace(/\\/g, "/");
}

class FileIndex {

    register(src = "/", dest = "/", sourcemaps = false) {
        const files = [];
        return through(function(file) {
            FILES.add(normalizePath(path.resolve(dest, path.relative(src, file.path))));
            if (sourcemaps) {
                FILES.add(normalizePath(path.resolve(dest, path.relative(src, `${file.path}.map`))));
            }
            this.push(file);
            return files.push(file);
        }, function() {
            return this.emit("end");
        });
    }

    add(filePath) {
        FILES.add(normalizePath(filePath));
    }

    finish(dest = "/", index = "index.json", config = {}) {
        const {
            usedImports = null,
            ignoreImportPaths = null,
            deleteUnused = true
        } = config;
        const indexPath = path.resolve(dest, index);
        const indexPathNormal = normalizePath(indexPath);
        console.log(`index file: ${indexPathNormal}`);
        const destFiles = glob.sync("./**/*", {
            nodir: true,
            cwd: dest,
            absolute: true
        });

        const removedImports = [];
        if (deleteUnused) {
            if (usedImports != null) {
                console.log("removing unused imports");
                for (const fName of FILES) {
                    if (fName.endsWith(".js") && !usedImports.has(fName)) {
                        if (ignoreImportPaths == null || !ignoreImportPaths.test(fName)) {
                            console.log(`remove import: ${fName}`);
                            FILES.delete(fName);
                            removedImports.push(fName);
                        }
                    }
                }
            }
            console.log("deleting unused files");
            for (const i in destFiles) {
                const fName = destFiles[i];
                if (fName != indexPathNormal && !FILES.has(fName)) {
                    console.log(`delete file: ${fName}`);
                    del.sync(fName);
                }
            }
        }

        // TODO remove empty folders

        const files = Array.from(FILES).sort().map((el)=>`/${path.relative(dest, el)}`.replace(/\\/g, "/"));
        files.push("/");
        console.log("write new index");
        fs.writeFileSync(indexPath, JSON.stringify(files, null, 4));
        fs.writeFileSync(path.resolve("import_removed.json"), JSON.stringify(removedImports.sort(), null, 4));
        FILES.clear();
        return indexPath;
    }

}

export default new FileIndex();
