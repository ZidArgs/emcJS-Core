import jsonParse from "../../patches/JSONParser.js";

const dl = document.createElement("a");
dl.style.position = "absolute !important";
dl.style.display = "none !important";
dl.style.opacity = "0 !important";
dl.style.visibility = "hidden !important";

const ul = document.createElement("input");
ul.setAttribute("type", "file");
ul.style.position = "absolute !important";
ul.style.display = "none !important";
ul.style.opacity = "0 !important";
ul.style.visibility = "hidden !important";

function convertData(dataUrl) {
    const pos = dataUrl.indexOf(",") + 1;
    const mime = dataUrl.slice(5, pos - 8);
    let res = dataUrl.slice(pos);
    switch (mime) {
        case "application/json":
            res = jsonParse(atob(res));
            break;
    }
    return {
        mime: mime,
        data: res
    };
}

class FileSystem {

    load(accept, multiple = false) {
        return new Promise((resolve, reject) => {
            try {
                // accept
                if (typeof accept == "string") {
                    ul.setAttribute("accept", accept);
                } else if (Array.isArray(accept)) {
                    ul.setAttribute("accept", accept.join(","));
                }
                // multiple
                if (multiple) {
                    ul.setAttribute("multiple", "");
                }

                ul.onchange = async () => {
                    if (ul.files.length > 0) {
                        const readers = [];
                        for (const fileData of ul.files) {
                            try {
                                readers.push(this.#readFile(fileData));
                            } catch (error) {
                                reject(error);
                            }
                        }
                        const content = await Promise.all(readers);
                        ul.value = null;
                        ul.removeAttribute("accept");
                        ul.removeAttribute("multiple");
                        resolve(multiple ? content : content[0]);
                    } else {
                        resolve(null);
                    }
                };
                ul.oncancel = () => {
                    resolve(null);
                };
                ul.onerror = () => {
                    reject("error in file selection");
                };
                ul.click();
            } catch {
                reject("error in file selection");
            }
        });
    }

    save(data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data], {type: "octet/stream"}));
        dl.href = url;
        dl.download = fileName;
        document.body.append(dl);
        dl.click();
        window.URL.revokeObjectURL(url);
        dl.remove();
    }

    #readFile(fileData) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve({
                    file: fileData,
                    name: fileData.name,
                    ...convertData(reader.result)
                });
            };
            reader.onabort = () => {
                resolve(null);
            };
            reader.onerror = () => {
                reject("error reading file");
            };
            reader.readAsDataURL(fileData);
        });
    }

}

export default new FileSystem();
