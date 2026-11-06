import Enum from "../Enum.js";

export default class HTTPStatusSeries extends Enum {

    static NONE = new this(0);

    static INFORMATIONAL = new this(1);

    static SUCCESSFUL = new this(2);

    static REDIRECTION = new this(3);

    static CLIENT_ERROR = new this(4);

    static SERVER_ERROR = new this(5);

}
