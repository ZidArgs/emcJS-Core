import path from "path";
import gulp from "gulp";
import newer from "gulp-newer";
import sourceImport from "./src/_build_tools/sourceImport.js";

const __dirname = path.resolve();

const IN_PATH = path.resolve(__dirname, "src");
const OUT_PATH = path.resolve(__dirname, "lib");
const DOC_PATH = path.resolve(__dirname, "webtest/emcJS");

const REBUILD = process.argv.indexOf("-rebuild") >= 0;

console.log({REBUILD});

function copyJS(dest = OUT_PATH) {
    const FILES = [
        `${IN_PATH}/**/*.js`,
        `!${IN_PATH}/*.js`
    ];
    let res = gulp.src(FILES);
    if (!REBUILD) {
        res = res.pipe(newer(dest))
    }
    res = res.pipe(sourceImport());
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyCSS(dest = OUT_PATH) {
    const FILES = [
        `${IN_PATH}/_style/**/*.css`
    ];
    let res = gulp.src(FILES);
    if (!REBUILD) {
        res = res.pipe(newer(`${dest}/_style`))
    }
    res = res.pipe(gulp.dest(`${dest}/_style`));
    return res;
}

export const build = gulp.parallel(
    copyJS,
    copyCSS
);

export const buildDoc = gulp.parallel(
    copyJS.bind(this, DOC_PATH),
    copyCSS.bind(this, DOC_PATH)
);
