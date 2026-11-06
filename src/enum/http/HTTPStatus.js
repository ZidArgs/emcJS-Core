import {isString} from "../../util/helper/CheckType.js";
import Enum from "../Enum.js";
import HTTPStatusSeries from "./HTTPStatusSeries.js";

export default class HTTPStatus extends Enum {

    #series;

    #reasonPhrase;

    constructor(value, series, reasonPhrase  = "") {
        if (!HTTPStatusSeries.includes(series)) {
            throw new TypeError("series must be of HTTPStatusSeries");
        }
        if (!isString(reasonPhrase)) {
            throw new TypeError("reasonPhrase must be a string");
        }
        super(value);
        this.#series = HTTPStatusSeries.get(series);
        this.#reasonPhrase = reasonPhrase;
    }

    get series() {
        return this.#series;
    }

    get reasonPhrase() {
        return this.#reasonPhrase;
    }

    static NONE = new this(0, HTTPStatusSeries.NONE, "None");

    // 1xx Informational

    /**
	 * @code 100 Continue.
	 */
    static CONTINUE = new this(100, HTTPStatusSeries.INFORMATIONAL, "Continue");

    /**
	 * @code 101 Switching Protocols.
	 */
    static SWITCHING_PROTOCOLS = new this(101, HTTPStatusSeries.INFORMATIONAL, "Switching Protocols");

    /**
	 * @code 102 Processing.
	 * @deprecated no longer used
	 */
    static PROCESSING = new this(102, HTTPStatusSeries.INFORMATIONAL, "Processing");

    /**
	 * @code 103 Early Hints.
	 */
    static EARLY_HINTS = new this(103, HTTPStatusSeries.INFORMATIONAL, "Early Hints");

    // 2xx Success

    /**
	 * @code 200 OK.
	 */
    static OK = new this(200, HTTPStatusSeries.SUCCESSFUL, "OK");

    /**
	 * @code 201 Created.
	 */
    static CREATED = new this(201, HTTPStatusSeries.SUCCESSFUL, "Created");

    /**
	 * @code 202 Accepted.
	 */
    static ACCEPTED = new this(202, HTTPStatusSeries.SUCCESSFUL, "Accepted");

    /**
	 * @code 203 Non-Authoritative Information.
	 */
    static NON_AUTHORITATIVE_INFORMATION = new this(203, HTTPStatusSeries.SUCCESSFUL, "Non-Authoritative Information");

    /**
	 * @code 204 No Content.
	 */
    static NO_CONTENT = new this(204, HTTPStatusSeries.SUCCESSFUL, "No Content");

    /**
	 * @code 205 Reset Content.
	 */
    static RESET_CONTENT = new this(205, HTTPStatusSeries.SUCCESSFUL, "Reset Content");

    /**
	 * @code 206 Partial Content.
	 */
    static PARTIAL_CONTENT = new this(206, HTTPStatusSeries.SUCCESSFUL, "Partial Content");

    /**
	 * @code 207 Multi-Status.
	 */
    static MULTI_STATUS = new this(207, HTTPStatusSeries.SUCCESSFUL, "Multi-Status");

    /**
	 * @code 208 Already Reported.
	 */
    static ALREADY_REPORTED = new this(208, HTTPStatusSeries.SUCCESSFUL, "Already Reported");

    /**
	 * @code 226 IM Used.
	 */
    static IM_USED = new this(226, HTTPStatusSeries.SUCCESSFUL, "IM Used");

    // 3xx Redirection

    /**
	 * @code 300 Multiple Choices.
	 */
    static MULTIPLE_CHOICES = new this(300, HTTPStatusSeries.REDIRECTION, "Multiple Choices");

    /**
	 * @code 301 Moved Permanently.
	 */
    static MOVED_PERMANENTLY = new this(301, HTTPStatusSeries.REDIRECTION, "Moved Permanently");

    /**
	 * @code 302 Found.
	 */
    static FOUND = new this(302, HTTPStatusSeries.REDIRECTION, "Found");

    /**
	 * @code 303 See Other.
	 */
    static SEE_OTHER = new this(303, HTTPStatusSeries.REDIRECTION, "See Other");

    /**
	 * @code 304 Not Modified.
	 */
    static NOT_MODIFIED = new this(304, HTTPStatusSeries.REDIRECTION, "Not Modified");

    /**
	 * @code 305 Use Proxy.
	 * @deprecated due to security concerns regarding in-band configuration of a proxy
	 */
    static USE_PROXY = new this(305, HTTPStatusSeries.REDIRECTION, "Use Proxy");

    /**
	 * @code 307 Temporary Redirect.
	 */
    static TEMPORARY_REDIRECT = new this(307, HTTPStatusSeries.REDIRECTION, "Temporary Redirect");

    /**
	 * @code 308 Permanent Redirect.
	 */
    static PERMANENT_REDIRECT = new this(308, HTTPStatusSeries.REDIRECTION, "Permanent Redirect");

    // --- 4xx Client Error ---

    /**
	 * @code 400 Bad Request.
	 */
    static BAD_REQUEST = new this(400, HTTPStatusSeries.CLIENT_ERROR, "Bad Request");

    /**
	 * @code 401 Unauthorized.
	 */
    static UNAUTHORIZED = new this(401, HTTPStatusSeries.CLIENT_ERROR, "Unauthorized");

    /**
	 * @code 402 Payment Required.
	 */
    static PAYMENT_REQUIRED = new this(402, HTTPStatusSeries.CLIENT_ERROR, "Payment Required");

    /**
	 * @code 403 Forbidden.
	 */
    static FORBIDDEN = new this(403, HTTPStatusSeries.CLIENT_ERROR, "Forbidden");

    /**
	 * @code 404 Not Found.
	 */
    static NOT_FOUND = new this(404, HTTPStatusSeries.CLIENT_ERROR, "Not Found");

    /**
	 * @code 405 Method Not Allowed.
	 */
    static METHOD_NOT_ALLOWED = new this(405, HTTPStatusSeries.CLIENT_ERROR, "Method Not Allowed");

    /**
	 * @code 406 Not Acceptable.
	 */
    static NOT_ACCEPTABLE = new this(406, HTTPStatusSeries.CLIENT_ERROR, "Not Acceptable");

    /**
	 * @code 407 Proxy Authentication Required.
	 */
    static PROXY_AUTHENTICATION_REQUIRED = new this(407, HTTPStatusSeries.CLIENT_ERROR, "Proxy Authentication Required");

    /**
	 * @code 408 Request Timeout.
	 */
    static REQUEST_TIMEOUT = new this(408, HTTPStatusSeries.CLIENT_ERROR, "Request Timeout");

    /**
	 * @code 409 Conflict.
	 */
    static CONFLICT = new this(409, HTTPStatusSeries.CLIENT_ERROR, "Conflict");

    /**
	 * @code 410 Gone.
	 */
    static GONE = new this(410, HTTPStatusSeries.CLIENT_ERROR, "Gone");

    /**
	 * @code 411 Length Required.
	 */
    static LENGTH_REQUIRED = new this(411, HTTPStatusSeries.CLIENT_ERROR, "Length Required");

    /**
	 * @code 412 Precondition failed.
	 */
    static PRECONDITION_FAILED = new this(412, HTTPStatusSeries.CLIENT_ERROR, "Precondition Failed");

    /**
	 * @code 413 Payload Too Large.
	 */
    static PAYLOAD_TOO_LARGE = new this(413, HTTPStatusSeries.CLIENT_ERROR, "Payload Too Large");

    /**
	 * @code 414 URI Too Long.
	 */
    static URI_TOO_LONG = new this(414, HTTPStatusSeries.CLIENT_ERROR, "URI Too Long");

    /**
	 * @code 415 Unsupported Media Type.
	 */
    static UNSUPPORTED_MEDIA_TYPE = new this(415, HTTPStatusSeries.CLIENT_ERROR, "Unsupported Media Type");

    /**
	 * @code 416 Requested Range Not Satisfiable.
	 */
    static REQUESTED_RANGE_NOT_SATISFIABLE = new this(416, HTTPStatusSeries.CLIENT_ERROR, "Requested range not satisfiable");

    /**
	 * @code 417 Expectation Failed.
	 */
    static EXPECTATION_FAILED = new this(417, HTTPStatusSeries.CLIENT_ERROR, "Expectation Failed");

    /**
	 * @code 418 I'm a teapot.
	 */
    static I_AM_A_TEAPOT = new this(418, HTTPStatusSeries.CLIENT_ERROR, "I'm a teapot");

    /**
	 * @code 421 Misdirected Request.
	 */
    static DESTINATION_LOCKED = new this(421, HTTPStatusSeries.CLIENT_ERROR, "Misdirected Request");

    /**
	 * @code 422 Unprocessable Entity.
	 */
    static UNPROCESSABLE_ENTITY = new this(422, HTTPStatusSeries.CLIENT_ERROR, "Unprocessable Entity");

    /**
	 * @code 423 Locked.
	 */
    static LOCKED = new this(423, HTTPStatusSeries.CLIENT_ERROR, "Locked");

    /**
	 * @code 424 Failed Dependency.
	 */
    static FAILED_DEPENDENCY = new this(424, HTTPStatusSeries.CLIENT_ERROR, "Failed Dependency");

    /**
	 * @code 425 Too Early.
     * @experimental
	 */
    static TOO_EARLY = new this(425, HTTPStatusSeries.CLIENT_ERROR, "Too Early");

    /**
	 * @code 426 Upgrade Required.
	 */
    static UPGRADE_REQUIRED = new this(426, HTTPStatusSeries.CLIENT_ERROR, "Upgrade Required");

    /**
	 * @code 428 Precondition Required.
	 */
    static PRECONDITION_REQUIRED = new this(428, HTTPStatusSeries.CLIENT_ERROR, "Precondition Required");

    /**
	 * @code 429 Too Many Requests.
	 */
    static TOO_MANY_REQUESTS = new this(429, HTTPStatusSeries.CLIENT_ERROR, "Too Many Requests");

    /**
	 * @code 431 Request Header Fields Too Large.
	 */
    static REQUEST_HEADER_FIELDS_TOO_LARGE = new this(431, HTTPStatusSeries.CLIENT_ERROR, "Request Header Fields Too Large");

    /**
	 * @code 451 Unavailable For Legal Reasons.
	 */
    static UNAVAILABLE_FOR_LEGAL_REASONS = new this(451, HTTPStatusSeries.CLIENT_ERROR, "Unavailable For Legal Reasons");

    // --- 5xx Server Error ---

    /**
	 * @code 500 Internal Server Error.
	 */
    static INTERNAL_SERVER_ERROR = new this(500, HTTPStatusSeries.SERVER_ERROR, "Internal Server Error");

    /**
	 * @code 501 Not Implemented.
	 */
    static NOT_IMPLEMENTED = new this(501, HTTPStatusSeries.SERVER_ERROR, "Not Implemented");

    /**
	 * @code 502 Bad Gateway.
	 */
    static BAD_GATEWAY = new this(502, HTTPStatusSeries.SERVER_ERROR, "Bad Gateway");

    /**
	 * @code 503 Service Unavailable.
	 */
    static SERVICE_UNAVAILABLE = new this(503, HTTPStatusSeries.SERVER_ERROR, "Service Unavailable");

    /**
	 * @code 504 Gateway Timeout.
	 */
    static GATEWAY_TIMEOUT = new this(504, HTTPStatusSeries.SERVER_ERROR, "Gateway Timeout");

    /**
	 * @code 505 HTTP Version Not Supported.
	 */
    static HTTP_VERSION_NOT_SUPPORTED = new this(505, HTTPStatusSeries.SERVER_ERROR, "HTTP Version not supported");

    /**
	 * @code 506 Variant Also Negotiates
	 */
    static VARIANT_ALSO_NEGOTIATES = new this(506, HTTPStatusSeries.SERVER_ERROR, "Variant Also Negotiates");

    /**
	 * @code 507 Insufficient Storage
	 */
    static INSUFFICIENT_STORAGE = new this(507, HTTPStatusSeries.SERVER_ERROR, "Insufficient Storage");

    /**
	 * @code 508 Loop Detected

 	 */
    static LOOP_DETECTED = new this(508, HTTPStatusSeries.SERVER_ERROR, "Loop Detected");

    /**
	 * @code 510 Not Extended
	 */
    static NOT_EXTENDED = new this(510, HTTPStatusSeries.SERVER_ERROR, "Not Extended");

    /**
	 * @code 511 Network Authentication Required.
	 */
    static NETWORK_AUTHENTICATION_REQUIRED = new this(511, HTTPStatusSeries.SERVER_ERROR, "Network Authentication Required");

}
