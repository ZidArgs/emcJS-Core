import {immute} from "../../../data/Immutable.js";

const PARAM_TYPES = ["undefined", "boolean", "number", "string"];

export default class LogicStatement extends Function {

    #dependencies = new Set();

    #params;

    #source;

    constructor(statement, opts = {}) {
        super(LogicStatement.parameterString, `return ${statement}`);

        const {
            dependencies = [], params = {}, source = {}
        } = opts;
        this.#source = immute(source);
        if (Symbol.iterator in Object(dependencies)) {
            for (const req of dependencies) {
                this.#dependencies.add(req);
            }
        }
        this.#params = immute(LogicStatement.parseParams(params));
    }

    get source() {
        return this.#source;
    }

    get dependencies() {
        return new Set(this.#dependencies);
    }

    get params() {
        return this.#params;
    }

    get paramNames() {
        return Object.keys(this.#params);
    }

    getParamType(name) {
        return this.#params[name];
    }

    serialize() {
        return {
            logic: this.source,
            params: this.params
        };
    }

    static get parameterString() {
        return "{val = () => false, data = () => false, exec = () => false, at = () => false, params = {}} = {}";
    }

    static parseParams(params) {
        if (typeof params == "object" && params != null) {
            if (Array.isArray(params)) {
                return params.reduce((a, v) => ({
                    ...a,
                    [v]: undefined
                }), {});
            } else {
                const res = {};
                for (const name in params) {
                    const def = params[name];
                    const type = typeof def;
                    res[name] = PARAM_TYPES.includes(type) ? def : undefined;
                }
                return res;
            }
        }
        return {};
    }

}
