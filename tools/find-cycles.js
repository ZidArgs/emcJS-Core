import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, ".."); // emcJS
const SRC = path.join(ROOT, "src");

function walk(dir) {
    const files = [];
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            files.push(...walk(full));
        } else if (stat.isFile() && full.endsWith(".js")) {
            files.push(full);
        }
    }
    return files;
}

function extractImports(content) {
    // return array of { spec, line, text }
    const results = [];
    const lines = content.split(/\r?\n/);
    const reStatic = /import\s+(?:[\s\S]+?)from\s+['"]([^'"]+)['"]/; // import ... from 'x'
    const reBare = /import\s+['"]([^'"]+)['"]/; // import 'x'
    const reDynamic = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/; // import('x')
    const reImportModule = /Import\.module\(\s*['"]([^'"]+)['"]\s*\)/;
    const reInject = /Inject\.(?:module|script)\(\s*['"]([^'"]+)['"]\s*\)/;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let m;
        if ((m = reStatic.exec(line)) || (m = reBare.exec(line)) || (m = reDynamic.exec(line)) || (m = reImportModule.exec(line)) || (m = reInject.exec(line))) {
            results.push({
                spec: m[1],
                line: i + 1,
                text: line.trim()
            });
        }
    }
    return results;
}

function resolveImport(fromFile, spec) {
    // handle relative imports first
    if (!spec.startsWith(".")) {
        // try to resolve bare/non-relative import to a workspace file
        const found = resolveBareImport(spec);
        if (found) {
            return found;
        }
        // otherwise return a module node id so we can include it in the graph
        return `module:${spec}`;
    }
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, spec);
    // If points to dir, try index.js
    const tryPaths = [];
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
        tryPaths.push(path.join(resolved, "index.js"));
    }
    // if spec has extension, use as is
    if (path.extname(resolved)) {
        tryPaths.unshift(resolved);
    } else {
        tryPaths.unshift(resolved + ".js");
    }
    for (const p of tryPaths) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
            // normalize to absolute path
            return path.resolve(p);
        }
    }
    // If not found, return null
    return null;
}

function resolveBareImport(spec) {
    // Best-effort: try to find a unique matching file in the scanned files list
    // If spec contains a slash (e.g. package/subpath), match by ending path
    const candidates = [];
    if (spec.includes("/")) {
        for (const f of files) {
            const rel = path.relative(SRC, f);
            if (rel === spec || rel === `${spec}.js` || rel.endsWith(`${spec}.js`) || rel.endsWith(`${spec}/index.js`)) {
                candidates.push(f);
            }
        }
    } else {
        // match by basename
        for (const f of files) {
            if (path.basename(f, ".js") === spec) {
                candidates.push(f);
            }
        }
    }
    if (candidates.length === 1) {
        return candidates[0];
    }
    return null; // ambiguous or not found
}

console.log("Scanning files under", SRC);
const files = walk(SRC);
console.log("Found", files.length, ".js files");

const graph = new Map();
for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    const imps = extractImports(content);
    const resolved = [];
    for (const specObj of imps) {
        const r = resolveImport(f, specObj.spec);
        if (r) {
            resolved.push({
                target: r,
                spec: specObj.spec,
                line: specObj.line,
                text: specObj.text
            });
        }
    }
    graph.set(path.resolve(f), resolved);
}

// Ensure any non-file module nodes are present in graph with empty neighbors
for (const edges of graph.values()) {
    for (const e of edges) {
        const t = e.target;
        // treat absolute paths (files) separately; module nodes are strings not under ROOT
        if (typeof t === "string" && !t.startsWith(ROOT) && !graph.has(t)) {
            graph.set(t, []);
        }
    }
}

// detect cycles using DFS
const visited = new Set();
const stack = [];
const onstack = new Set();
const cycles = [];

function dfs(node) {
    visited.add(node);
    stack.push(node);
    onstack.add(node);
    const neighbors = graph.get(node) || [];
    for (const nbObj of neighbors) {
        const nb = nbObj.target;
        if (!graph.has(nb)) {
            continue;
        } // skip external or unresolved
        if (!visited.has(nb)) {
            dfs(nb);
        } else if (onstack.has(nb)) {
            // cycle found: nodes from nb to end of stack
            const idx = stack.indexOf(nb);
            const cycle = stack.slice(idx).concat(nb);
            // store cycle as array of nodes (leave as-is, format later)
            cycles.push(cycle.slice());
        }
    }
    stack.pop();
    onstack.delete(node);
}

for (const node of graph.keys()) {
    if (!visited.has(node)) {
        dfs(node);
    }
}

if (cycles.length === 0) {
    console.log("No circular dependencies detected.");
} else {
    console.log("Detected", cycles.length, "cycles:");
    cycles.forEach((c, i) => {
        console.log(`\nCycle ${i + 1}:`);
        // c is array of nodes, last element repeats the first
        for (let idx = 0; idx < c.length - 1; idx++) {
            const fromNode = c[idx];
            const toNode = c[idx + 1];

            const formatNode = (p) => {
                if (typeof p !== "string") {
                    return String(p);
                }
                if (p.startsWith(ROOT)) {
                    return path.relative(ROOT, p);
                }
                return p; // module node
            };

            const fromLabel = formatNode(fromNode);
            const toLabel = formatNode(toNode);

            const edges = graph.get(fromNode) || [];
            const edge = edges.find((e) => e.target === toNode || path.resolve(e.target) === path.resolve(toNode));
            if (edge) {
                console.log(`  ${idx + 1}. ${fromLabel} -> ${toLabel} (L${edge.line}): ${edge.text}`);
            } else {
                console.log(`  ${idx + 1}. ${fromLabel} -> ${toLabel} (no direct import found)`);
            }
        }
    });
}

// Also write a machine-readable JSON report for CI / further processing
try {
    const toPosix = (p) => typeof p === "string" ? p.split(path.sep).join("/") : p;

    const nodeToRelPosix = (node) => {
        if (typeof node !== "string") {
            return String(node);
        }
        if (node.startsWith("module:")) {
            return node;
        }
        let abs = node;
        if (!path.isAbsolute(node)) {
            abs = path.resolve(ROOT, node);
        }
        const rel = path.relative(ROOT, abs);
        return toPosix(rel);
    };

    const report = {
        root: ".",
        generatedAt: new Date().toISOString(),
        cycles: []
    };

    for (const c of cycles) {
        const edges = [];
        for (let idx = 0; idx < c.length - 1; idx++) {
            const fromRel = c[idx];
            const toRel = c[idx + 1];
            const fromAbs = path.resolve(ROOT, fromRel);
            const toAbs = path.resolve(ROOT, toRel);
            const candidates = graph.get(fromAbs) || [];
            const edge = candidates.find((e) => path.resolve(e.target) === path.resolve(toAbs));
            const fromOut = nodeToRelPosix(fromAbs);
            const toOut = nodeToRelPosix(toAbs);
            edges.push({
                from: fromOut,
                to: toOut,
                spec: edge ? toPosix(edge.spec) : null,
                line: edge ? edge.line : null,
                text: edge ? edge.text : null
            });
        }
        report.cycles.push({edges});
    }

    const outDir = path.resolve(__dirname, "output");
    fs.mkdirSync(outDir, {recursive: true});
    const outPath = path.join(outDir, "cycle-report.json");
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
    console.log("\nWrote JSON report to", outPath);

    // Also produce a simple text report (human-readable) alongside the JSON
    try {
        const txtLines = [];
        // determine max width of line numbers so colons align
        let maxDigits = 0;
        for (const cycle of report.cycles) {
            for (const edge of cycle.edges) {
                if (edge.line) {
                    const digits = String(edge.line).length;
                    if (digits > maxDigits) {
                        maxDigits = digits;
                    }
                }
            }
        }

        report.cycles.forEach((cycle, ci) => {
            txtLines.push(`Cycle ${ci + 1}:`);
            cycle.edges.forEach((edge, ei) => {
                const from = edge.from;
                const to = edge.to;
                txtLines.push(`${ei + 1}. ${from} -> ${to}`);
                if (edge.line && edge.text) {
                    const padded = String(edge.line).padStart(maxDigits, " ");
                    // no leading 'L' as requested; align the ':' column
                    txtLines.push(`\tLine ${padded}: ${edge.text}`);
                }
            });
            txtLines.push("");
        });
        const txtPath = path.join(outDir, "cycle-report.txt");
        fs.writeFileSync(txtPath, txtLines.join("\n"), "utf8");
        console.log("Wrote text report to", txtPath);
    } catch (err2) {
        console.error("Failed to write text report:", err2 && err2.stack ? err2.stack : err2);
    }
} catch (err) {
    console.error("Failed to write JSON report:", err && err.stack ? err.stack : err);
}

process.exit(0);
