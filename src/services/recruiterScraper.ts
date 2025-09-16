import Apify from 'apify';
import cheerio from 'cheerio';
import { LinkedInClient } from './linkedinClient';
import { BaseJob, EnrichedJob } from '../types/job';
import { log } from '../logging/logger';

interface RecruiterScrapeParams { jobs: BaseJob[]; concurrency: number }

export class RecruiterScraper {
    constructor(private client: LinkedInClient) {}

    private parse(html: string) {
        const $ = cheerio.load(html);
        let description = '';
        const descSelectors = [
            '.description__text',
            '.show-more-less-html__markup',
            '.jobs-description__container',
            '.jobs-description-content__text',
            '.job-details-module__content'
        ];
        for (const sel of descSelectors) {
            if ($(sel).length) { description = $(sel).text().replace(/\s+/g,' ').trim(); if (description) break; }
        }
        if (!description) description = $('section').first().text().replace(/\s+/g,' ').trim();
        description = description.slice(0,500);
        let recruiter_name: string | null = null;
        let recruiter_profile_url: string | null = null;
        const areas = [
            'div.jobs-poster__container',
            'li.jobs-poster__resume-trigger',
            'div.jobs-poster',
            'section.jobs-poster',
            'div.jobs-poster__content'
        ];
        for (const sel of areas) {
            const area = $(sel);
            if (!area.length) continue;
            const link = area.find('a[href*="/in/"]').first();
            if (link.length) {
                recruiter_name = link.text().replace(/\s+/g,' ').trim() || null;
                recruiter_profile_url = link.attr('href') || null;
                break;
            }
        }
        if (!recruiter_name) {
            $('a[href*="/in/"]').each((_i,a) => {
                if (recruiter_name) return;
                const link = $(a);
                const txt = link.text().trim();
                if (txt && /^[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){0,3}$/.test(txt)) {
                    recruiter_name = txt;
                    recruiter_profile_url = link.attr('href') || null;
                }
            });
        }
        if (recruiter_profile_url && recruiter_profile_url.startsWith('/')) {
            recruiter_profile_url = `https://www.linkedin.com${recruiter_profile_url.split('?')[0]}`;
        }
        return { recruiter_name, recruiter_profile_url, job_description: description || null };
    }

    async scrape(params: RecruiterScrapeParams): Promise<Map<string, { recruiter_name: string|null; recruiter_profile_url: string|null; job_description: string|null }>> {
        const { jobs, concurrency } = params;
        const queue = await Apify.openRequestQueue();
        for (const j of jobs) {
            await queue.addRequest({ url: j.job_url, uniqueKey: j.job_url, userData: { type: 'DETAIL', job_url: j.job_url }});
        }
        const map = new Map<string, { recruiter_name: string|null; recruiter_profile_url: string|null; job_description: string|null }>();
        const crawler = new Apify.BasicCrawler({
            requestQueue: queue,
            maxConcurrency: concurrency,
            handleRequestTimeoutSecs: 120,
            handleRequestFunction: async ({ request }) => {
                const html = await this.client.fetch(request.url);
                const parsed = this.parse(html);
                map.set(request.userData.job_url, parsed);
            },
            handleFailedRequestFunction: async ({ request, error }) => {
                log.error(`Failed detail ${request.url}: ${error.message}`);
            }
        });
        await crawler.run();
        return map;
    }
}