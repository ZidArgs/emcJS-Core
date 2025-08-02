import OrderedMap from "../../data/collection/OrderedMap.js";
import TokenStorage, {
    TOKEN_LITERAL_MATCHER,
    TOKEN_MATCHER,
    toTokenLiteral
} from "./TokenStorage.js";

// structure
// const GTE = /(.*?)(?:\()([^,()]+),\s*([^,()]+)(?:\))(.*)/;
// const MIN = /(.*?)(?:\()([^,()]+),\s*([0-9]+)(?:\))(.*)/;
// const FUNCTIONS = /(.*?)([^()\s]+)\(([^()]+)\)(.*)/;
// const BRACKETS = /(.*?)(?:\()([^,()]+)(?:\))(.*)/;
// operators
// const NOT = /(.*?)(?:not ([^,()\s]+|'[^']+'))(.*)/;
// const COMPARATOR = /(.*?)([^\s]+)\s*((?:!|>|<|=)?=|<|>)\s*([^\s]+|'[^']+')(.*?)/;
// const VALUE = /[^\s]+|'[^']+'/;
const TOKEN_COMBINE_MATCHER = new RegExp(TOKEN_MATCHER, "g");

export default class Tokenizer {

    #rules = new OrderedMap();

    rule(matcher, callback) {
        if (matcher instanceof RegExp) {
            matcher = matcher.source;
        }
        const rule = `(.*?)${matcher}(.*)`;
        this.#rules.set(matcher, {
            matcher: new RegExp(rule),
            callback
        });
    }

    unrule(matcher) {
        if (matcher instanceof RegExp) {
            matcher = matcher.source;
        }
        this.#rules.delete(matcher);
    }

    process(term, tokenStorage = new TokenStorage()) {
        if (!(tokenStorage instanceof TokenStorage)) {
            throw new TypeError("tokenStorage must be a TokenStorage");
        }
        const processedTerm = this.#process(term.trim(), tokenStorage);
        tokenStorage.add(processedTerm);
        return processedTerm;
    }

    #process(term, tokenStorage) {
        if (!TOKEN_LITERAL_MATCHER.test(term)) {
            for (const rule of this.#rules.values()) {
                const {
                    matcher,
                    callback
                } = rule;
                const match = matcher.exec(term);
                if (match != null) {
                    const fullMatch = match.shift(); // full matching string
                    const prefix = match.shift();
                    const postfix = match.pop();

                    const processedTerm = callback(tokenStorage, match, fullMatch);
                    if (!prefix && !postfix) {
                        return processedTerm;
                    }
                    const idx = tokenStorage.add(processedTerm);
                    return this.#process(`${prefix}${toTokenLiteral(idx)}${postfix}`, tokenStorage);
                }
            }
        }
        return term;
    }

    static combine(term, tokenStorage) {
        return term.replace(TOKEN_COMBINE_MATCHER, (match, idx) => {
            idx = parseInt(idx);
            const token = tokenStorage.at(idx);
            return Tokenizer.combine(token, tokenStorage);
        });
    }

}
