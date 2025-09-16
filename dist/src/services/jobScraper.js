"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.JobScraper = void 0;
const apify_1 = __importDefault(require("apify"));
const cheerio = __importStar(require("cheerio"));
const logger_1 = require("../logging/logger");
const DEBUG = process.env.DEBUG_SCRAPER === '1';
class JobScraper {
    constructor(client) {
        this.client = client;
    }
    buildUrl(keyword, location, start, filters) {
        const base = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
        const params = new URLSearchParams();
        params.set('keywords', keyword);
        params.set('location', location);
        params.set('start', String(start));
        Object.entries(filters || {}).forEach(([k, v]) => {
            if (v == null || v === '')
                return;
            params.set(k, Array.isArray(v) ? v.join(',') : String(v));
        });
        return `${base}?${params.toString()}`;
    }
    parse(html) {
        if (!html)
            return [];
        const $ = cheerio.load(html);
        const jobs = [];
        $('li').each((_i, el) => {
            const c = $(el);
            const job_title = c.find('h3, h2').first().text().trim() || null;
            let company_name = c.find('.base-search-card__subtitle').first().text().trim() || null;
            if (!company_name)
                company_name = c.find('.job-card-container__company-name').first().text().trim() || null;
            let job_url = c.find('a.result-card__full-card-link, a.base-card__full-link, a').first().attr('href') || '';
            if (job_url)
                job_url = job_url.split('?')[0];
            const location = c.find('.job-search-card__location').first().text().trim() || null;
            const publication_date = c.find('time').attr('datetime') || c.find('time').text().trim() || null;
            const job_description = c.find('.job-card-container__description-snippet, .job-search-card__snippet').text().trim().slice(0, 500) || null;
            if (job_title && job_url) {
                jobs.push({ job_title, company_name, job_url, location, publication_date, job_description });
            }
        });
        if (DEBUG)
            logger_1.log.info(`[DEBUG][PARSE] extracted=${jobs.length}`);
        return jobs;
    }
    scrape(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { keywords, location, maxResults, searchFilters, concurrency } = params;
            const PAGE_SIZE = 25;
            const pagesPerKeyword = Math.max(1, Math.ceil(maxResults / PAGE_SIZE));
            // Use ephemeral queue name to avoid stale state issues
            const queueName = `jobs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const queue = yield apify_1.default.openRequestQueue(queueName);
            for (const kw of keywords) {
                for (let p = 0; p < pagesPerKeyword; p++) {
                    const start = p * PAGE_SIZE;
                    const url = this.buildUrl(kw, location, start, searchFilters);
                    yield queue.addRequest({ url, uniqueKey: `L-${kw}-${start}`, userData: { type: 'LIST', keyword: kw, start } });
                }
            }
            const seen = new Set();
            const out = [];
            const crawler = new apify_1.default.BasicCrawler({
                requestQueue: queue,
                maxConcurrency: concurrency,
                handleRequestTimeoutSecs: 120,
                handleRequestFunction: ({ request }) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (out.length >= maxResults)
                            return;
                        const body = yield this.client.fetch(request.url);
                        const parsed = this.parse(body);
                        for (const j of parsed) {
                            if (out.length >= maxResults)
                                break;
                            if (seen.has(j.job_url))
                                continue;
                            seen.add(j.job_url);
                            out.push(Object.assign(Object.assign({}, j), { keyword: request.userData.keyword, scraped_at: new Date().toISOString() }));
                        }
                    }
                    catch (err) {
                        logger_1.log.error(`Request failed for ${request.url}: ${err.message}`);
                        throw err; // rethrow so crawler retry logic still applies
                    }
                }),
                handleFailedRequestFunction: ({ request, error }) => __awaiter(this, void 0, void 0, function* () {
                    logger_1.log.error(`Failed listing ${request.url}: ${error.message}`);
                })
            });
            yield crawler.run();
            return out.slice(0, maxResults);
        });
    }
}
exports.JobScraper = JobScraper;
