import INIResource from "./file/INIResource.js";
import JSONResource from "./file/JSONResource.js";
import JSONCResource from "./file/JSONCResource.js";
import PropertiesResource from "./file/PropertiesResource.js";
import TextResource from "./file/TextResource.js";
import XMLResource from "./file/XMLResource.js";
import DataResource from "./DataResource.js";

const RESOURCE_TYPES = {
    "ini": INIResource,
    "json": JSONResource,
    "jsonc": JSONCResource,
    "properties": PropertiesResource,
    "text": TextResource,
    "xml": XMLResource
};

const RESOURCES = {};

class FileData {

    async load(files) {
        const loading = [];
        for (const name in files) {
            let path = files[name];
            let type = "text";
            if (typeof path == "object") {
                type = path.type;
                path = path.path;
            }
            if (RESOURCE_TYPES[type] == null) {
                console.warn(`unknown file type "${type}" for entry "${name}" -> loading as type "text"`);
                type = "text";
            }
            if (typeof path != "string" || path == "") {
                throw new Error(`no path specified for entry "${name}"`);
            }
            const resourceLoader = RESOURCE_TYPES[type];
            loading.push(resourceLoader.get(path).then((resource) => {
                RESOURCES[name] = resource;
            }).catch(function(err) {
                throw new Error(`error getting contents of file - ${path}:\n${err.message}`);
            }));
        }
        await Promise.all(loading);
    }

    inject(sources) {
        for (const name in sources) {
            const data = data[name];
            RESOURCES[name] = new DataResource(data);
        }
    }

    get(name, value = null) {
        return RESOURCES[name] ?? value;
    }

}

export default new FileData;
