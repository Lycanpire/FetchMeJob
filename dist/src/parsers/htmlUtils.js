"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractElementsBySelector = exports.extractAttribute = exports.extractTextContent = exports.parseHtml = void 0;
const parseHtml = (html) => {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
};
exports.parseHtml = parseHtml;
const extractTextContent = (element) => {
    var _a;
    return ((_a = element.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
};
exports.extractTextContent = extractTextContent;
const extractAttribute = (element, attribute) => {
    return element.getAttribute(attribute);
};
exports.extractAttribute = extractAttribute;
const extractElementsBySelector = (document, selector) => {
    return Array.from(document.querySelectorAll(selector));
};
exports.extractElementsBySelector = extractElementsBySelector;
