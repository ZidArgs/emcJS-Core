import fs from 'fs';

function resolveFiles(path, imports) {
    const result = {};
    const files = fs.readdirSync(path, {
        withFileTypes: true
    });
    for (const file of files) {
        if (file.isDirectory() && file.name != ".git" && file.name != "_demo") {
            const inFiles = resolveFiles(`${path}/${file.name}`, imports);
            if (Object.keys(inFiles).length) {
                result[file.name] = inFiles;
            }
        } else if (path.length > 1 && file.isFile() && file.name != "index.js" && file.name.endsWith(".js") && !file.name.endsWith(".worker.js")) {
            const filename = file.name.slice(0, -3);
            const varname = `${path.slice(2).replace(/\//g, "_")}_${filename}`;
            imports.push(`import ${varname} from "${path}/${file.name}";`);
            result[filename] = varname;
        }
    }
    return result;
}

function createIndex() {
    const imports = [];
    const result = resolveFiles(".", imports);
    const exports = JSON.stringify(result, null, 4).replace(/: "(.*)"(,?)/g, ': $1$2');
    fs.writeFileSync("./index.js", `${imports.join("\n")}\n\nexport default ${exports};\n`);
}

createIndex();
