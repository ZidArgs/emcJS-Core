import fs from "fs";
import path from "path";
import through from "through";

const FILES = new Map();

function normalizePath(path) {
    return path.replace(/\\/g, "/");
}

class ImageIndex {

    reset() {
        FILES.clear();
    }

    register(src = "/", dest = "/") {
        const files = [];
        return through(function(file) {
            const filePath = normalizePath(path.resolve(dest, path.relative(src, file.path)));
            const parsedPath = path.parse(filePath);
            const name = parsedPath.name;
            FILES.set(filePath, name);
            this.push(file);
            return files.push(file);
        }, function() {
            return this.emit("end");
        });
    }

    finish(dest = "/", index = "index.images.json", pattern = null) {
        const indexPath = path.resolve(dest, index);
        const indexPathNormal = normalizePath(indexPath);
        console.log(`image index file: ${indexPathNormal}`);

        const files = {};

        for (const [filePath, name] of FILES) {
            const relativePath = `/${path.relative(dest, filePath)}`.replace(/\\/g, "/");
            if (pattern == null || pattern.test(relativePath)) {
                files[relativePath] = name;
            }
        }

        console.log("write new image index");
        fs.writeFileSync(indexPath, JSON.stringify(files, null, 4));
        return indexPath;
    }

}

export default new ImageIndex();
