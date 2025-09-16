"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValidator = void 0;
const DEFAULTS = {
    maxResults: 50,
    includeRecruiterInfo: false,
    minDelayMs: 2000,
    maxDelayMs: 5000,
    maxRetries: 5,
    concurrency: 5
};
class InputValidator {
    static validate(input) {
        var _a, _b;
        if (!input || typeof input !== 'object')
            throw new Error('Input must be object');
        let { keywords } = input;
        if (typeof keywords === 'string')
            keywords = [keywords];
        if (!Array.isArray(keywords) || !keywords.length) {
            throw new Error('"keywords" must be a non-empty array or string.');
        }
        if (!input.location || typeof input.location !== 'string') {
            throw new Error('"location" is required.');
        }
        const maxResults = InputValidator.boundInt(input.maxResults, 1, 500, DEFAULTS.maxResults);
        const minDelayMs = InputValidator.boundInt(input.minDelayMs, 0, 30000, DEFAULTS.minDelayMs);
        const maxDelayMs = InputValidator.boundInt(input.maxDelayMs, minDelayMs, 60000, DEFAULTS.maxDelayMs);
        const maxRetries = InputValidator.boundInt(input.maxRetries, 0, 10, DEFAULTS.maxRetries);
        const concurrency = InputValidator.boundInt(input.concurrency, 1, 10, DEFAULTS.concurrency);
        return {
            keywords: keywords,
            location: input.location,
            maxResults,
            includeRecruiterInfo: !!input.includeRecruiterInfo,
            proxy: { useProxy: ((_a = input.proxy) === null || _a === void 0 ? void 0 : _a.useProxy) !== false, proxyUrl: (_b = input.proxy) === null || _b === void 0 ? void 0 : _b.proxyUrl },
            minDelayMs,
            maxDelayMs,
            maxRetries,
            concurrency,
            searchFilters: input.searchFilters || {}
        };
    }
    static boundInt(val, min, max, def) {
        if (typeof val !== 'number' || Number.isNaN(val))
            return def;
        return Math.min(max, Math.max(min, Math.floor(val)));
    }
}
exports.InputValidator = InputValidator;
