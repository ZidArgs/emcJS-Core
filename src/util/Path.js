class Path {

    getAbsolute(current, path) {
        current = current.replace(window.location.origin, "").split("/");
        current.pop();
        path = path.split("/");
        for (const step of path) {
            if (step == "..") {
                current.pop();
            } else if (step != ".") {
                current.push(step);
            }
        }
        return current.join("/");
    }

}

export default new Path;
