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
require("dotenv/config"); // load env vars early
const apify_1 = __importDefault(require("apify"));
const inputValidator_1 = require("./validation/inputValidator");
const proxy_1 = require("./utils/proxy");
const linkedinClient_1 = require("./services/linkedinClient");
const jobScraper_1 = require("./services/jobScraper");
const recruiterScraper_1 = require("./services/recruiterScraper");
const storageService_1 = require("./services/storageService");
const logger_1 = require("./logging/logger");
apify_1.default.main(() => __awaiter(void 0, void 0, void 0, function* () {
    const raw = (yield apify_1.default.getInput()) || {};
    const rawInput = (typeof raw === 'object' && !Array.isArray(raw) ? raw : {}); // ensure object
    const input = inputValidator_1.InputValidator.validate(rawInput);
    const { keywords, location, maxResults, includeRecruiterInfo, proxy, minDelayMs, maxDelayMs, maxRetries, concurrency, searchFilters } = input;
    logger_1.log.info(`Input: keywords=${keywords.join('|')} location="${location}" maxResults=${maxResults} recruiter=${includeRecruiterInfo}`);
    const proxyUrl = proxy_1.ProxyFactory.resolve(proxy);
    if (proxyUrl) {
        logger_1.log.info(`Using proxy (${proxyUrl.includes('lum-superproxy') ? 'Brightdata' : proxyUrl})`);
    }
    else {
        logger_1.log.warning('No proxy configured. Risk of rapid blocking.');
    }
    const client = new linkedinClient_1.LinkedInClient({ proxyUrl, minDelayMs, maxDelayMs, maxRetries });
    const jobScraper = new jobScraper_1.JobScraper(client);
    const recruiterScraper = new recruiterScraper_1.RecruiterScraper(client);
    const storage = new storageService_1.StorageService();
    // 1. Collect base job data
    const baseJobs = yield jobScraper.scrape({
        keywords,
        location,
        maxResults,
        searchFilters,
        concurrency
    });
    logger_1.log.info(`Base jobs scraped: ${baseJobs.length}`);
    // 2. Optionally enrich recruiter info
    let finalJobs = baseJobs;
    if (includeRecruiterInfo) {
        const recruiterMap = yield recruiterScraper.scrape({ jobs: baseJobs, concurrency });
        finalJobs = baseJobs.map(j => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            const r = recruiterMap.get(j.job_url) || {};
            return Object.assign(Object.assign({}, j), { recruiter_name: (_a = r.recruiter_name) !== null && _a !== void 0 ? _a : null, recruiter_profile_url: (_b = r.recruiter_profile_url) !== null && _b !== void 0 ? _b : null, job_description: (_d = (_c = r.job_description) !== null && _c !== void 0 ? _c : j.job_description) !== null && _d !== void 0 ? _d : null, job_poster_name: (_e = r.job_poster_name) !== null && _e !== void 0 ? _e : null, job_poster_title: (_f = r.job_poster_title) !== null && _f !== void 0 ? _f : null, job_poster_profile_url: (_g = r.job_poster_profile_url) !== null && _g !== void 0 ? _g : null, company_linkedin_url: (_h = r.company_linkedin_url) !== null && _h !== void 0 ? _h : null, company_id: (_j = r.company_id) !== null && _j !== void 0 ? _j : null, number_of_applications: (_k = r.number_of_applications) !== null && _k !== void 0 ? _k : null, employment_type: (_l = r.employment_type) !== null && _l !== void 0 ? _l : null, seniority_level: (_m = r.seniority_level) !== null && _m !== void 0 ? _m : null, job_function: (_o = r.job_function) !== null && _o !== void 0 ? _o : null, industries: (_p = r.industries) !== null && _p !== void 0 ? _p : null, salary: (_q = r.salary) !== null && _q !== void 0 ? _q : null, external_apply_url: (_r = r.external_apply_url) !== null && _r !== void 0 ? _r : null });
        });
        logger_1.log.info(`Enriched recruiter metadata for ${recruiterMap.size} jobs.`);
    }
    else {
        // ensure fields present as null to satisfy CSV aggregation requirement
        finalJobs = baseJobs.map(j => (Object.assign(Object.assign({}, j), { recruiter_name: null, recruiter_profile_url: null })));
    }
    // 3. Persist
    yield storage.saveJobs(finalJobs);
    yield storage.exportCsv('jobs.csv');
    logger_1.log.info(`Actor finished. Total output jobs: ${finalJobs.length}`);
}));
