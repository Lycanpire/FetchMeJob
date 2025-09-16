import got from 'got';
import { randomInt } from '../utils/random';
import { randomUserAgent } from '../utils/userAgents';
import { log } from '../logging/logger';

const DEBUG = process.env.DEBUG_SCRAPER === '1';

// New helper to obtain auth values lazily
const authEnv = () => ({
    bearer: process.env.LINKEDIN_ACCESS_TOKEN,
    session: process.env.LINKEDIN_SESSION_COOKIE,
});

export interface LinkedInClientOptions {
    proxyUrl?: string | null;
    minDelayMs: number;
    maxDelayMs: number;
    maxRetries: number;
}

export class LinkedInClient {
    private proxyUrl?: string | null;
    private minDelay: number;
    private maxDelay: number;
    private maxRetries: number;

    constructor(opts: LinkedInClientOptions) {
        this.proxyUrl = opts.proxyUrl;
        this.minDelay = opts.minDelayMs;
        this.maxDelay = opts.maxDelayMs;
        this.maxRetries = opts.maxRetries;
    }

    async fetch(url: string): Promise<string> {
        return this.request(url);
    }

    private async request(url: string, attempt = 0): Promise<string> {
        const delay = randomInt(this.minDelay, this.maxDelay);
        if (delay > 0) await new Promise(r => setTimeout(r, delay));

        const headers = {
            'User-Agent': randomUserAgent(),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.linkedin.com/jobs/search/'
        } as Record<string, string>;

        const { bearer, session } = authEnv();
        if (bearer) {
            headers['Authorization'] = `Bearer ${bearer}`;
        } else if (session) {
            headers['Cookie'] = `li_at=${session}`;
        }

        const options: any = { headers, throwHttpErrors: false, timeout: { request: 30000 } };
        if (this.proxyUrl) {
            options.agent = { http: new (require('proxy-agent'))(this.proxyUrl), https: new (require('proxy-agent'))(this.proxyUrl) };
        }

        let response;
        try {
            if (DEBUG) log.info(`[DEBUG][HTTP][REQ] attempt=${attempt} ${url}`);
            response = await got(url, options);
            if (DEBUG) {
                const snippet = (response.body || '').slice(0,300).replace(/\s+/g,' ');
                log.info(`[DEBUG][HTTP][RES] status=${response.statusCode} attempt=${attempt} ${url} bodyPreview="${snippet}"`);
            }
        } catch (e: any) {
            if (DEBUG) log.error(`[DEBUG][HTTP][ERR] attempt=${attempt} ${url} msg=${e.message} code=${e.code || ''}`);
            if (attempt < this.maxRetries) {
                const backoff = 1200 * Math.pow(2, attempt);
                log.warning(`Network error: ${e.message}. Retry in ${backoff}ms`);
                await new Promise(r => setTimeout(r, backoff));
                return this.request(url, attempt + 1);
            }
            throw e;
        }

        const sc = response.statusCode;
        if ([301,302,303,307,308].includes(sc)) {
            // LinkedIn sometimes responds with redirect to sign-in or auth wall; treat as rate-limit style backoff
            const loc = response.headers['location'];
            if (DEBUG) log.warning(`[DEBUG][HTTP][REDIRECT] ${sc} -> ${loc}`);
        }
        if ([429, 430, 999].includes(sc)) { // 999 = LinkedIn custom throttle / block code sometimes surfaced
            if (attempt < this.maxRetries) {
                const backoff = 1500 * Math.pow(2, attempt) + randomInt(0, 500);
                log.warning(`Rate limited/block ${sc}. Backoff ${backoff}ms attempt ${attempt + 1}`);
                await new Promise(r => setTimeout(r, backoff));
                return this.request(url, attempt + 1);
            }
            throw new Error(`Rate limited or blocked after retries: ${sc} ${url}`);
        }
        if (sc >= 500 && attempt < this.maxRetries) {
            const backoff = 1500 * Math.pow(2, attempt);
            log.warning(`Server error ${sc}. Retry in ${backoff}ms`);
            await new Promise(r => setTimeout(r, backoff));
            return this.request(url, attempt + 1);
        }
        if (sc >= 400) {
            const snippet = (response.body || '').slice(0,200).replace(/\s+/g,' ');
            throw new Error(`Request failed ${sc} ${url} bodyPreview="${snippet}"`);
        }
        return response.body;
    }
}