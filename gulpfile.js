import path from "path";
import gulp from "gulp";
import newer from "gulp-newer";
import sourceImport from "./src/_build_tools/sourceImport.js";
import ImportAnalyzer from "./src/_build_tools/ImportAnalyzer.js";

const __dirname = path.resolve();

const IN_PATH = path.resolve(__dirname, "src");
const OUT_PATH = path.resolve(__dirname, "lib");
const DOC_TARGET_PATH = path.resolve(__dirname, "webtest");
const DOC_LIB_PATH = path.resolve(__dirname, "webtest/emcJS");

const REBUILD = process.argv.indexOf("-rebuild") >= 0;

console.log({REBUILD});

function copyJS(dest = OUT_PATH, target = OUT_PATH) {
    const FILES = [
        `${IN_PATH}/**/*.js`,
        `!${IN_PATH}/*.js`,
        `!${IN_PATH}/_build_tools/*.js`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(ImportAnalyzer.register(IN_PATH, dest, target));
    if (!REBUILD) {
        res = res.pipe(newer(dest));
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
        res = res.pipe(newer(`${dest}/_style`));
    }
    res = res.pipe(gulp.dest(`${dest}/_style`));
    return res;
}

function finish(done) {
    const unresolvedImports = ImportAnalyzer.getUnresolvedImports();
    if (unresolvedImports.length > 0) {
        console.error("Unresolved imported files detected");
        for (const unresolvedImportEntry of unresolvedImports) {
            console.log("Unknown import:", unresolvedImportEntry);
        }
    }
    done();
}

export const build = gulp.series(
    gulp.parallel(
        copyJS,
        copyCSS
    ),
    finish
);

export const buildDoc = gulp.series(
    gulp.parallel(
        copyJS.bind(this, DOC_LIB_PATH, DOC_TARGET_PATH),
        copyCSS.bind(this, DOC_LIB_PATH, DOC_TARGET_PATH)
    ),
    finish
);
