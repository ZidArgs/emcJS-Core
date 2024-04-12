import Enum from "../../data/Enum.js";

export default class HTTPMethods extends Enum {

    static GET = new this("GET");

    static HEAD = new this("HEAD");

    static POST = new this("POST");

    static PUT = new this("PUT");

    static DELETE = new this("DELETE");

    static CONNECT = new this("CONNECT");

    static OPTIONS = new this("OPTIONS");

    static TRACE = new this("TRACE");

    static PATCH = new this("PATCH");

    static SEARCH = new this("SEARCH");

    static QUERY = new this("QUERY");

}
