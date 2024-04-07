import {
    unescapeUnicode
} from "./Unicode.js";

/* eslint-disable no-control-regex */
const ESC_BACKSLASH = /\\/g;
const ESC_NULL = /\0/g;
const ESC_NEWLINE = /\n/g;
const ESC_CARIAGE_RETURN = /\r/g;
const ESC_TAB = /\t/g;
const ESC_VERTICAL_TAB = /\v/g;
const ESC_FORM_FEED = /\f/g;
const ESC_BACKSPACE = /\x08/g;
const ESC_SINGLE_QUOTE = /'/g;
const ESC_DOUBLE_QUOTE = /"/g;

export function escapeString(str) {
    return str
        .replace(ESC_BACKSLASH, "\\\\")
        .replace(ESC_NULL, "\\0")
        .replace(ESC_NEWLINE, "\\n")
        .replace(ESC_CARIAGE_RETURN, "\\r")
        .replace(ESC_TAB, "\\t")
        .replace(ESC_VERTICAL_TAB, "\\v")
        .replace(ESC_FORM_FEED, "\\f")
        .replace(ESC_BACKSPACE, "\\b")
        .replace(ESC_SINGLE_QUOTE, "\\'")
        .replace(ESC_DOUBLE_QUOTE, "\\\"");
}

const UNESC_BACKSLASH = /\\\\/g;
const UNESC_NULL = /\\0/g;
const UNESC_NEWLINE = /\\n/g;
const UNESC_CARIAGE_RETURN = /\\r/g;
const UNESC_TAB = /\\t/g;
const UNESC_VERTICAL_TAB = /\\v/g;
const UNESC_FORM_FEED = /\\f/g;
const UNESC_BACKSPACE = /\\b/g;
const UNESC_SINGLE_QUOTE = /\\'/g;
const UNESC_DOUBLE_QUOTE = /\\"/g;

export function unescapeString(str) {
    return unescapeUnicode(str
        .replace(UNESC_BACKSLASH, "\\u005C")
        .replace(UNESC_NULL, "\0")
        .replace(UNESC_NEWLINE, "\n")
        .replace(UNESC_CARIAGE_RETURN, "\r")
        .replace(UNESC_TAB, "\t")
        .replace(UNESC_VERTICAL_TAB, "\v")
        .replace(UNESC_FORM_FEED, "\f")
        .replace(UNESC_BACKSPACE, "\\b")
        .replace(UNESC_SINGLE_QUOTE, "'")
        .replace(UNESC_DOUBLE_QUOTE, "\""));
}

export function escapeHTMLEntities(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
