export interface RawInput {
    keywords?: string[] | string;
    location?: string;
    maxResults?: number;
    includeRecruiterInfo?: boolean;
    proxy?: { useProxy?: boolean; proxyUrl?: string };
    minDelayMs?: number;
    maxDelayMs?: number;
    maxRetries?: number;
    concurrency?: number;
    searchFilters?: Record<string, any>;
}

export interface NormalizedInput {
    keywords: string[];
    location: string;
    maxResults: number;
    includeRecruiterInfo: boolean;
    proxy: { useProxy: boolean; proxyUrl?: string };
    minDelayMs: number;
    maxDelayMs: number;
    maxRetries: number;
    concurrency: number;
    searchFilters: Record<string, any>;
}

const DEFAULTS = {
    maxResults: 50,
    includeRecruiterInfo: false,
    minDelayMs: 2000,
    maxDelayMs: 5000,
    maxRetries: 5,
    concurrency: 5
};

export class InputValidator {
    static validate(input: RawInput): NormalizedInput {
        if (!input || typeof input !== 'object') throw new Error('Input must be object');

        let { keywords } = input;
        if (typeof keywords === 'string') keywords = [keywords];
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
            keywords: keywords as string[],
            location: input.location,
            maxResults,
            includeRecruiterInfo: !!input.includeRecruiterInfo,
            proxy: { useProxy: input.proxy?.useProxy !== false, proxyUrl: input.proxy?.proxyUrl },
            minDelayMs,
            maxDelayMs,
            maxRetries,
            concurrency,
            searchFilters: input.searchFilters || {}
        };
    }

    private static boundInt(val: any, min: number, max: number, def: number) {
        if (typeof val !== 'number' || Number.isNaN(val)) return def;
        return Math.min(max, Math.max(min, Math.floor(val)));
    }
}