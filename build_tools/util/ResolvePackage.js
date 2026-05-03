import fs from "fs";
import path from "path";
import {normalizePath} from "./NormalizePath.js";
import jsonParse from "../../src/patches/JSONParser.js";

export function resolvePackageName(importPath) {
    const parts = normalizePath(importPath).split("/");
    while (parts.length > 0) {
        parts.pop();
        const packagePath = parts.join("/");
        const packageFile = path.resolve(packagePath, "package.json");
        if (fs.existsSync(packageFile)) {
            const fileContent = fs.readFileSync(packageFile).toString();
            const packageConfig = jsonParse(fileContent);
            return packageConfig.name;
        }
    }
    return "";
}
