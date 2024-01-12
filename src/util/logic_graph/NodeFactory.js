const EDGES = new WeakMap();
const NAME = new WeakMap();

class Node {

    constructor(name) {
        EDGES.set(this, new Map());
        NAME.set(this, name);
    }

    getName() {
        return NAME.get(this);
    }

    append(node, condition) {
        if (node instanceof Node) {
            const edges = EDGES.get(this);
            edges.set(node.getName(), new Edge(this, node, condition));
        } else {
            throw new TypeError("Expected type Node");
        }
    }

    remove(node) {
        if (node instanceof Node) {
            const edges = EDGES.get(this);
            edges.delete(node.getName());
        } else {
            throw new TypeError("Expected type Node");
        }
    }

    getTargets() {
        const edges = EDGES.get(this);
        return edges.keys();
    }

    getEdge(name) {
        const edges = EDGES.get(this);
        return edges.get(name);
    }

    toString() {
        return this.getName();
    }

}

const SOURCE = new WeakMap();
const TARGET = new WeakMap();
const CONDITION = new WeakMap();

class Edge {

    constructor(source, target, condition) {
        SOURCE.set(this, source);
        TARGET.set(this, target);
        CONDITION.set(this, condition);
    }

    getCondition() {
        return CONDITION.get(this);
    }

    getTarget() {
        return TARGET.get(this);
    }

    getSource() {
        return SOURCE.get(this);
    }

    toString() {
        return `${SOURCE.get(this)} => ${TARGET.get(this)}`;
    }

}

/* node factory */
const NODES = new WeakMap();

export default class NodeFactory {

    constructor() {
        NODES.set(this, new Map());
    }

    reset() {
        const nodes = NODES.get(this);
        nodes.clear();
    }

    get(name) {
        const nodes = NODES.get(this);
        if (nodes.has(name)) {
            return nodes.get(name);
        }
        const node = new Node(name);
        nodes.set(name, node);
        return node;
    }

    getNames() {
        const nodes = NODES.get(this);
        return nodes.keys();
    }

}
