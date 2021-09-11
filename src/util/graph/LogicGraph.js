import NodeFactory from "./NodeFactory.js";
import EdgeLogicCompiler from "./EdgeLogicCompiler.js";

function mapToObj(src) {
    const res = {};
    src.forEach((v, k) => {
        res[k] = v;
    });
    return res;
}

function setToArray(src) {
    const res = [];
    src.forEach(v => {
        res.push(v);
    });
    return res;
}

const DIRTY = new WeakMap();
const MIXINS = new WeakMap();
const MEM_I = new WeakMap();
const MEM_O = new WeakMap();
const DEBUG = new WeakMap();
const NODES = new WeakMap();

const REDIRECT_MATRIX = new WeakMap();
const FORCED_REACHABLE = new WeakMap();

export default class LogicGraph {

    constructor(debug = false) {
        NODES.set(this, new NodeFactory());
        MIXINS.set(this, new Map());
        MEM_I.set(this, new Map());
        MEM_O.set(this, new Map());
        REDIRECT_MATRIX.set(this, new Map());
        FORCED_REACHABLE.set(this, new Set());
        DIRTY.set(this, false);
        DEBUG.set(this, debug);
    }

    set debug(value) {
        DEBUG.set(this, value);
    }

    get debug() {
        return DEBUG.get(this);
    }

    clearGraph() {
        const nodeFactory = NODES.get(this);
        nodeFactory.reset();
    }

    load(config) {
        const debug = DEBUG.get(this);
        const nodeFactory = NODES.get(this);
        const mixins = MIXINS.get(this);
        const mem_o = MEM_O.get(this);
        if (debug) {
            console.groupCollapsed("GRAPH LOGIC BUILD");
            console.time("build time");
        }
        for (const name in config.edges) {
            const children = config.edges[name];
            const node = nodeFactory.get(name);
            for (const child in children) {
                const logic = children[child];
                const fn = EdgeLogicCompiler.compile(logic);
                node.append(nodeFactory.get(child), fn);
                if (!mem_o.has(child)) {
                    mem_o.set(child, false);
                }
            }
        }
        for (const name in config.logic) {
            const logic = config.logic[name];
            const fn = EdgeLogicCompiler.compile(logic);
            mixins.set(name, fn);
        }
        if (debug) {
            console.timeEnd("build time");
            console.groupEnd("GRAPH LOGIC BUILD");
        }
        DIRTY.set(this, true);
    }

    setEdge(source, target, value) {
        const debug = DEBUG.get(this);
        const nodeFactory = NODES.get(this);
        if (debug) {
            console.groupCollapsed("GRAPH LOGIC BUILD");
            console.time("build time");
        }
        const node = nodeFactory.get(source);
        const child = nodeFactory.get(target);
        if (typeof value == "undefined" || value == null) {
            node.remove(child);
            DIRTY.set(this, true);
        } else {
            const fn = EdgeLogicCompiler.compile(value);
            node.append(child, fn);
            DIRTY.set(this, true);
        }
        DIRTY.set(this, true);
        if (debug) {
            console.timeEnd("build time");
            console.groupEnd("GRAPH LOGIC BUILD");
        }
    }

    setMixin(name, value) {
        const debug = DEBUG.get(this);
        const mixins = MIXINS.get(this);
        if (debug) {
            console.groupCollapsed("GRAPH LOGIC BUILD");
            console.time("build time");
        }
        if (typeof value == "undefined" || value == null) {
            mixins.delete(name);
            DIRTY.set(this, true);
        } else {
            const fn = EdgeLogicCompiler.compile(value);
            mixins.set(name, fn);
            DIRTY.set(this, true);
        }
        if (debug) {
            console.timeEnd("build time");
            console.groupEnd("GRAPH LOGIC BUILD");
        }
        DIRTY.set(this, true);
    }

    clearRedirects() {
        const debug = DEBUG.get(this);
        if (debug == "extended") {
            console.log("GRAPH LOGIC REDIRECT RESET");
        }
        const redirectMatrix = REDIRECT_MATRIX.get(this);
        redirectMatrix.clear();
    }

    setRedirect(source, target, reroute) {
        const debug = DEBUG.get(this);
        if (debug == "extended") {
            console.groupCollapsed("GRAPH LOGIC REDIRECT CHANGE");
            console.log({[`${source} => ${target}`]: reroute});
            console.groupEnd("GRAPH LOGIC REDIRECT CHANGE");
        }
        const redirectMatrix = REDIRECT_MATRIX.get(this);
        if (reroute == null) {
            redirectMatrix.delete(`${source} => ${target}`);
        } else {
            redirectMatrix.set(`${source} => ${target}`, `${reroute}`);
        }
    }

    setAllRedirects(redirects) {
        const debug = DEBUG.get(this);
        if (debug == "extended") {
            console.groupCollapsed("GRAPH LOGIC REDIRECT CHANGE");
        }
        const redirectMatrix = REDIRECT_MATRIX.get(this);
        for (const {source, target, reroute} of redirects) {
            if (debug == "extended") {
                console.log({[`${source} => ${target}`]: reroute});
            }
            if (reroute == null) {
                redirectMatrix.delete(`${source} => ${target}`);
            } else {
                redirectMatrix.set(`${source} => ${target}`, `${reroute}`);
            }
        }
        if (debug == "extended") {
            console.groupEnd("GRAPH LOGIC REDIRECT CHANGE");
        }
    }

    getRedirect(source, target) {
        const redirectMatrix = REDIRECT_MATRIX.get(this);
        if (redirectMatrix.has(`${source} => ${target}`)) {
            return redirectMatrix.get(`${source} => ${target}`);
        }
        return target;
    }

    getEdges() {
        const nodeFactory = NODES.get(this);
        const nodes = nodeFactory.getNames();
        const res = [];
        for (const name of nodes) {
            const node = nodeFactory.get(name);
            const children = node.getTargets();
            for (const ch of children) {
                res.push([name, ch]);
            }
        }
        return res;
    }

    getTargetNodes() {
        const nodeFactory = NODES.get(this);
        const nodes = nodeFactory.getNames();
        const res = new Set();
        for (const name of nodes) {
            const node = nodeFactory.get(name);
            const children = node.getTargets();
            for (const ch of children) {
                res.add(ch);
            }
        }
        return res;
    }

    addReachable(target) {
        const forcedReachable = FORCED_REACHABLE.get(this);
        forcedReachable.add(target);
    }

    deleteReachable(target) {
        const forcedReachable = FORCED_REACHABLE.get(this);
        forcedReachable.delete(target);
    }

    clearReachables() {
        const forcedReachable = FORCED_REACHABLE.get(this);
        forcedReachable.clear();
    }

    /* broad search */
    traverse(startNode) {
        const nodeFactory = NODES.get(this);
        const allTargets = this.getTargetNodes();
        let reachableCount = 0;
        const reachableNodes = new Set();
        const changes = {};
        const mixins = MIXINS.get(this);
        const mem_o = MEM_O.get(this);
        const mem_i = MEM_I.get(this);
        const debug = DEBUG.get(this);
        const start = nodeFactory.get(startNode);
        if (start != null) {
            const forcedReachable = FORCED_REACHABLE.get(this);
            if (debug) {
                const redirectMatrix = REDIRECT_MATRIX.get(this);
                console.groupCollapsed("GRAPH LOGIC EXECUTION");
                console.log("input", mapToObj(mem_i));
                console.log("redirects", mapToObj(redirectMatrix));
                console.log("forced", setToArray(forcedReachable));
                console.log("traverse nodes...");
                console.time("execution time");
                if (debug == "extended") {
                    console.groupCollapsed("traversion graph");
                }
            }

            for (const name of forcedReachable) {
                reachableNodes.add(name);
            }

            const valueGetter = key => {
                if (allTargets.has(key) && reachableNodes.has(key)) {
                    return 1;
                } else if (mem_i.has(key)) {
                    return mem_i.get(key);
                }
                return 0;
            };

            const execute = name => {
                if (mixins.has(name)) {
                    const fn = mixins.get(name);
                    const res = fn(valueGetter, execute);
                    if (debug == "extended") {
                        console.groupCollapsed(`execute mixin { ${name} }`);
                        console.log(fn.toString());
                        console.log(`result: ${res}`);
                        console.groupEnd(`execute mixin { ${name} }`);
                    }
                    return res;
                }
                return 0;
            };

            /* start traversion */
            const queue = [];
            for (const ch of start.getTargets()) {
                const edge = start.getEdge(ch);
                queue.push(edge);
            }
            let changed = true;
            while (!!queue.length && !!changed) {
                changed = false;
                let counts = queue.length;
                while (counts--) {
                    const edge = queue.shift();
                    const condition = edge.getCondition();
                    if (debug == "extended") {
                        console.groupCollapsed(`traverse edge { ${edge} }`);
                        console.log(condition.toString());
                    }
                    const cRes = condition(valueGetter, execute);
                    if (cRes) {
                        changed = true;
                        const name = this.getRedirect(edge.getSource().getName(), edge.getTarget().getName());
                        if (debug == "extended") {
                            if (name != edge.getTarget().getName()) {
                                console.log(`redirecting edge { ${edge} } to point to { ${name} }`);
                            }
                        }
                        if (name != "") {
                            const node = nodeFactory.get(name);
                            reachableNodes.add(name);
                            const targets = node.getTargets();
                            for (const ch of targets) {
                                const chEdge = node.getEdge(ch);
                                const chName = this.getRedirect(chEdge.getSource().getName(), chEdge.getTarget().getName());
                                if (!reachableNodes.has(chName)) {
                                    queue.push(chEdge);
                                }
                            }
                        }
                    } else {
                        queue.push(edge);
                    }
                    if (debug == "extended") {
                        console.log(`result: ${cRes}`);
                        console.groupEnd(`traverse edge { ${edge} }`);
                        if (reachableCount != reachableNodes.size) {
                            console.log("reachable changed", Array.from(reachableNodes));
                        }
                    }
                    reachableCount = reachableNodes.size;
                }
            }
            /* end traversion */

            DIRTY.set(this, false);
            for (const ch of allTargets) {
                const v = reachableNodes.has(ch);
                if (mem_o.get(ch) != v) {
                    mem_o.set(ch, v);
                    changes[ch] = v;
                }
            }
            if (debug) {
                if (debug == "extended") {
                    console.groupEnd("traversion graph");
                }
                console.log("success");
                console.timeEnd("execution time");
                console.log("reachable", Array.from(reachableNodes));
                console.log("output", mapToObj(mem_o));
                console.log("changes", changes);
                console.groupEnd("GRAPH LOGIC EXECUTION");
            }
        }
        return changes;
    }

    set(key, value) {
        const debug = DEBUG.get(this);
        if (debug) {
            console.groupCollapsed("GRAPH LOGIC MEMORY CHANGE");
            console.log({[key]: value});
            console.groupEnd("GRAPH LOGIC MEMORY CHANGE");
        }
        const mem_i = MEM_I.get(this);
        mem_i.set(key, value);
        DIRTY.set(this, true);
    }

    setAll(values) {
        const debug = DEBUG.get(this);
        if (debug) {
            console.groupCollapsed("GRAPH LOGIC MEMORY CHANGE");
        }
        const mem_i = MEM_I.get(this);
        if (values instanceof Map) {
            for (const [k, v] of values) {
                if (debug) {
                    console.log({[k]: v});
                }
                mem_i.set(k, v);
            }
        } else if (typeof values == "object" && !Array.isArray(values)) {
            for (const k in values) {
                const v = values[k];
                if (debug) {
                    console.log({[k]: v});
                }
                mem_i.set(k, v);
            }
        }
        DIRTY.set(this, true);
        if (debug) {
            console.groupEnd("GRAPH LOGIC MEMORY CHANGE");
        }
    }

    get(ref) {
        const mem_o = MEM_O.get(this);
        if (mem_o.has(ref)) {
            return mem_o.get(ref);
        }
        return false;
    }

    getAll() {
        const mem_o = MEM_O.get(this);
        const obj = {};
        mem_o.forEach((v, k) => {obj[k] = v});
        return obj;
    }

    has(ref) {
        const mem_o = MEM_O.get(this);
        if (mem_o.has(ref)) {
            return true;
        }
        return false;
    }

    reset() {
        const debug = DEBUG.get(this);
        if (debug) {
            console.log("GRAPH LOGIC MEMORY RESET");
        }
        const mem_i = MEM_I.get(this);
        const mem_o = MEM_O.get(this);
        mem_i.clear();
        mem_o.clear();
        DIRTY.set(this, true);
    }

    isDirty() {
        return DIRTY.get(this);
    }

}
