import path from "path";
import gulp from "gulp";
import changed, {compareContents} from "gulp-changed";
import sourceImport from "./build_tools/SourceImport.js";
import ImportAnalyzer from "./build_tools/ImportAnalyzer.js";

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
    res = res.pipe(sourceImport());
    if (!REBUILD) {
        res = res.pipe(changed(dest, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyCSS(dest = OUT_PATH) {
    const FILES = [
        `${IN_PATH}/_style/**/*.css`
    ];
    let res = gulp.src(FILES);
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/_style`));
    }
    res = res.pipe(gulp.dest(`${dest}/_style`));
    return res;
}

function copyFonts(dest = OUT_PATH) {
    const FILES = [
        `${IN_PATH}/_fonts/**/*.ttf`,
        `${IN_PATH}/_fonts/**/*.eot`,
        `${IN_PATH}/_fonts/**/*.otf`,
        `${IN_PATH}/_fonts/**/*.woff`,
        `${IN_PATH}/_fonts/**/*.woff2`,
        `${IN_PATH}/_fonts/**/*.svg`
    ];
    let res = gulp.src(FILES);
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/_fonts`));
    }
    res = res.pipe(gulp.dest(`${dest}/_fonts`));
    return res;
}

function finish(done) {
    ImportAnalyzer.printUnresolvedImports();
    // ImportAnalyzer.writeImportFile();
    done();
}

export const build = gulp.series(
    gulp.parallel(
        copyJS,
        copyCSS,
        copyFonts
    ),
    finish
);

export const buildDoc = gulp.series(
    gulp.parallel(
        copyJS.bind(this, DOC_LIB_PATH, DOC_TARGET_PATH),
        copyCSS.bind(this, DOC_LIB_PATH, DOC_TARGET_PATH),
        copyFonts.bind(this, DOC_LIB_PATH, DOC_TARGET_PATH)
    ),
    finish
);
