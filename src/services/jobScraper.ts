import Apify from 'apify';
import * as cheerio from 'cheerio';
import { LinkedInClient } from './linkedinClient';
import { BaseJob } from '../types/job';
import { log } from '../logging/logger';

const DEBUG = process.env.DEBUG_SCRAPER === '1';

interface JobScrapeParams {
    keywords: string[];
    location: string;
    maxResults: number;
    searchFilters: Record<string, any>;
    concurrency: number;
}

export class JobScraper {
    constructor(private client: LinkedInClient) {}

    private buildUrl(keyword: string, location: string, start: number, filters: Record<string, any>) {
        const base = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
        const params = new URLSearchParams();
        params.set('keywords', keyword);
        params.set('location', location);
        params.set('start', String(start));
        Object.entries(filters || {}).forEach(([k,v]) => {
            if (v == null || v === '') return;
            params.set(k, Array.isArray(v) ? v.join(',') : String(v));
        });
        return `${base}?${params.toString()}`;
    }

    private parse(html: string) : Omit<BaseJob,'keyword'|'scraped_at'>[] {
        if (!html) return [];
        const $ = cheerio.load(html);
        const jobs: Omit<BaseJob,'keyword'|'scraped_at'>[] = [];
        $('li').each((_i, el) => {
            const c = $(el);
            const job_title = c.find('h3, h2').first().text().trim() || null;
            let company_name = c.find('.base-search-card__subtitle').first().text().trim() || null;
            if (!company_name) company_name = c.find('.job-card-container__company-name').first().text().trim() || null;
            let job_url = c.find('a.result-card__full-card-link, a.base-card__full-link, a').first().attr('href') || '';
            if (job_url) job_url = job_url.split('?')[0];
            const location = c.find('.job-search-card__location').first().text().trim() || null;
            const publication_date = c.find('time').attr('datetime') || c.find('time').text().trim() || null;
            const job_description = c.find('.job-card-container__description-snippet, .job-search-card__snippet').text().trim().slice(0,500) || null;
            if (job_title && job_url) {
                jobs.push({ job_title, company_name, job_url, location, publication_date, job_description });
            }
        });
        if (DEBUG) log.info(`[DEBUG][PARSE] extracted=${jobs.length}`);
        return jobs;
    }

    async scrape(params: JobScrapeParams): Promise<BaseJob[]> {
        const { keywords, location, maxResults, searchFilters, concurrency } = params;
        const PAGE_SIZE = 25;
        const pagesPerKeyword = Math.max(1, Math.ceil(maxResults / PAGE_SIZE));
        // Use ephemeral queue name to avoid stale state issues
        const queueName = `jobs-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const queue = await Apify.openRequestQueue(queueName);
        for (const kw of keywords) {
            for (let p=0; p < pagesPerKeyword; p++) {
                const start = p * PAGE_SIZE;
                const url = this.buildUrl(kw, location, start, searchFilters);
                await queue.addRequest({ url, uniqueKey: `L-${kw}-${start}`, userData: { type: 'LIST', keyword: kw, start }});
            }
        }
        const seen = new Set<string>();
        const out: BaseJob[] = [];
        const crawler = new Apify.BasicCrawler({
            requestQueue: queue,
            maxConcurrency: concurrency,
            handleRequestTimeoutSecs: 120,
            handleRequestFunction: async ({ request }) => {
                try {
                    if (out.length >= maxResults) return;
                    const body = await this.client.fetch(request.url);
                    const parsed = this.parse(body);
                    for (const j of parsed) {
                        if (out.length >= maxResults) break;
                        if (seen.has(j.job_url)) continue;
                        seen.add(j.job_url);
                        out.push({ ...j, keyword: request.userData.keyword, scraped_at: new Date().toISOString() });
                    }
                } catch (err: any) {
                    log.error(`Request failed for ${request.url}: ${err.message}`);
                    throw err; // rethrow so crawler retry logic still applies
                }
            },
            handleFailedRequestFunction: async ({ request, error }) => {
                log.error(`Failed listing ${request.url}: ${error.message}`);
            }
        });
        await crawler.run();
        return out.slice(0,maxResults);
    }
}