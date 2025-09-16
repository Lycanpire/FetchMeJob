"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInClient = void 0;
const got_1 = __importDefault(require("got"));
const random_1 = require("../utils/random");
const userAgents_1 = require("../utils/userAgents");
const logger_1 = require("../logging/logger");
const DEBUG = process.env.DEBUG_SCRAPER === '1';
// New helper to obtain auth values lazily
const authEnv = () => ({
    bearer: process.env.LINKEDIN_ACCESS_TOKEN,
    session: process.env.LINKEDIN_SESSION_COOKIE,
});
class LinkedInClient {
    constructor(opts) {
        this.proxyUrl = opts.proxyUrl;
        this.minDelay = opts.minDelayMs;
        this.maxDelay = opts.maxDelayMs;
        this.maxRetries = opts.maxRetries;
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(url);
        });
    }
    request(url, attempt = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            const delay = (0, random_1.randomInt)(this.minDelay, this.maxDelay);
            if (delay > 0)
                yield new Promise(r => setTimeout(r, delay));
            const headers = {
                'User-Agent': (0, userAgents_1.randomUserAgent)(),
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.linkedin.com/jobs/search/'
            };
            const { bearer, session } = authEnv();
            if (bearer) {
                headers['Authorization'] = `Bearer ${bearer}`;
            }
            else if (session) {
                headers['Cookie'] = `li_at=${session}`;
            }
            const options = { headers, throwHttpErrors: false, timeout: { request: 30000 } };
            if (this.proxyUrl) {
                options.agent = { http: new (require('proxy-agent'))(this.proxyUrl), https: new (require('proxy-agent'))(this.proxyUrl) };
            }
            let response;
            try {
                if (DEBUG)
                    logger_1.log.info(`[DEBUG][HTTP][REQ] attempt=${attempt} ${url}`);
                response = yield (0, got_1.default)(url, options);
                if (DEBUG) {
                    const snippet = (response.body || '').slice(0, 300).replace(/\s+/g, ' ');
                    logger_1.log.info(`[DEBUG][HTTP][RES] status=${response.statusCode} attempt=${attempt} ${url} bodyPreview="${snippet}"`);
                }
            }
            catch (e) {
                if (DEBUG)
                    logger_1.log.error(`[DEBUG][HTTP][ERR] attempt=${attempt} ${url} msg=${e.message} code=${e.code || ''}`);
                if (attempt < this.maxRetries) {
                    const backoff = 1200 * Math.pow(2, attempt);
                    logger_1.log.warning(`Network error: ${e.message}. Retry in ${backoff}ms`);
                    yield new Promise(r => setTimeout(r, backoff));
                    return this.request(url, attempt + 1);
                }
                throw e;
            }
            const sc = response.statusCode;
            if ([301, 302, 303, 307, 308].includes(sc)) {
                // LinkedIn sometimes responds with redirect to sign-in or auth wall; treat as rate-limit style backoff
                const loc = response.headers['location'];
                if (DEBUG)
                    logger_1.log.warning(`[DEBUG][HTTP][REDIRECT] ${sc} -> ${loc}`);
            }
            if ([429, 430, 999].includes(sc)) { // 999 = LinkedIn custom throttle / block code sometimes surfaced
                if (attempt < this.maxRetries) {
                    const backoff = 1500 * Math.pow(2, attempt) + (0, random_1.randomInt)(0, 500);
                    logger_1.log.warning(`Rate limited/block ${sc}. Backoff ${backoff}ms attempt ${attempt + 1}`);
                    yield new Promise(r => setTimeout(r, backoff));
                    return this.request(url, attempt + 1);
                }
                throw new Error(`Rate limited or blocked after retries: ${sc} ${url}`);
            }
            if (sc >= 500 && attempt < this.maxRetries) {
                const backoff = 1500 * Math.pow(2, attempt);
                logger_1.log.warning(`Server error ${sc}. Retry in ${backoff}ms`);
                yield new Promise(r => setTimeout(r, backoff));
                return this.request(url, attempt + 1);
            }
            if (sc >= 400) {
                const snippet = (response.body || '').slice(0, 200).replace(/\s+/g, ' ');
                throw new Error(`Request failed ${sc} ${url} bodyPreview="${snippet}"`);
            }
            return response.body;
        });
    }
}
exports.LinkedInClient = LinkedInClient;
