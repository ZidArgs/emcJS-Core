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

class FileSystem {

    load(extensions) {
        return new Promise((resolve, reject) => {
            if (typeof extensions == "string") {
                ul.setAttribute("accept", extensions);
            }
            if (Array.isArray(extensions)) {
                ul.setAttribute("accept", extensions.join(","));
            }
            ul.onchange = function(event) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(convertData(e.target.result));
                };
                reader.onabort = resolve;
                reader.onerror = reject;
                reader.readAsDataURL(event.target.files[0]);
                ul.removeAttribute("accept");
            };
            ul.onerror = reject;
            ul.click();
        });
    }

    save(data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data], {type: "octet/stream"}));
        dl.href = url;
        dl.download = fileName;
        document.body.append(dl);
        dl.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(dl);
    }

}

export default new FileSystem;

function convertData(dataUrl) {
    const pos = dataUrl.indexOf(',') + 1;
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
