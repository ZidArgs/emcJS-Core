import path from "path";
import gulp from "gulp";
import newer from "gulp-newer";
import sourceImport from "./build_tools/sourceImport.js";

const __dirname = path.resolve();

const IN_PATH = path.resolve(__dirname, "src");
const OUT_PATH = path.resolve(__dirname, "documentation/emcJS");

const REBUILD = process.argv.indexOf("-rebuild") >= 0;

console.log({REBUILD});

function copyJS() {
    const FILES = [
        `${IN_PATH}/**/*.js`,
        `!${IN_PATH}/*.js`
    ];
    let res = gulp.src(FILES);
    if (!REBUILD) {
        res = res.pipe(newer(OUT_PATH))
    }
    res = res.pipe(sourceImport());
    res = res.pipe(gulp.dest(OUT_PATH));
    return res;
}

function copyCSS() {
    const FILES = [
        `${IN_PATH}/_style/**/*.css`
    ];
    let res = gulp.src(FILES);
    if (!REBUILD) {
        res = res.pipe(newer(`${OUT_PATH}/_style`))
    }
    res = res.pipe(gulp.dest(`${OUT_PATH}/_style`));
    return res;
}

export const build = gulp.parallel(
    copyJS,
    copyCSS
);
