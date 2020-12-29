import NodeFactory from "./NodeFactory.js";

const NODES = new WeakMap();

export default class AccessGraph {

    constructor() {
        NODES.set(this, new NodeFactory());
    }

    clearGraph() {
        const nodeFactory = NODES.get(this);
        nodeFactory.reset();
    }

    load(config) {
        const nodeFactory = NODES.get(this);
        for (const cfg in config) {
            const children = config[cfg];
            const node = nodeFactory.get(cfg);
            for (const child in children) {
                const condition = children[child];
                node.append(nodeFactory.get(child), condition);
            }
        }
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

    /* broad search */
    traverse(startNode) {
        const nodeFactory = NODES.get(this);
        const reachableNodes = new Set();
        const start = nodeFactory.get(startNode);
        if (start != null) {
            const queue = [];
            queue.push(start);
            while (queue.length) {
                const node = queue.shift();
                reachableNodes.add(node.getName())
                for (const ch in node.getTargets()) {
                    const child = node.getEdge(ch).getTarget();
                    if (!reachableNodes.has(ch)) {
                        queue.push(child);
                    }
                }
            }
        }
        return Array.from(reachableNodes);
    }

}
