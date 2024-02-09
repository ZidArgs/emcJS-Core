import {
    debounce
} from "../Debouncer.js";

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
            res = JSON.parse(atob(res));
            break;
    }
    return {
        mime: mime,
        data: res
    };
}

class FileSystem {

    load(extensions) {
        return new Promise((resolve, reject) => {
            try {
                if (typeof extensions == "string") {
                    ul.setAttribute("accept", extensions);
                }
                if (Array.isArray(extensions)) {
                    ul.setAttribute("accept", extensions.join(","));
                }

                const cancelDetector = debounce(() => {
                    if (ul.files.length === 0) {
                        window.removeEventListener("focus", cancelDetector);
                        resolve(null);
                    }
                }, 100);

                ul.onchange = () => {
                    if (ul.files.length > 0) {
                        cancelDetector.cancel();
                        window.removeEventListener("focus", cancelDetector);
                        const fileData = ul.files[0];
                        ul.value = null;
                        const reader = new FileReader();
                        reader.onload = () => {
                            resolve(convertData(reader.result));
                        };
                        reader.onabort = () => {
                            resolve(null);
                        };
                        reader.onerror = () => {
                            reject("error reading file");
                        };
                        reader.readAsDataURL(fileData);
                        ul.removeAttribute("accept");
                    } else {
                        resolve(null);
                    }
                };
                ul.onabort = () => {
                    resolve(null);
                };
                ul.onerror = () => {
                    reject("error in file selection");
                };
                ul.click();

                window.addEventListener("focus", cancelDetector, false);
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

}

export default new FileSystem();
