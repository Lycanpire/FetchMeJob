import Apify from 'apify';
import cheerio from 'cheerio';
import { LinkedInClient } from './linkedinClient';
import { BaseJob } from '../types/job';
import { log } from '../logging/logger';

interface RecruiterScrapeParams { jobs: BaseJob[]; concurrency: number }

type DetailExtract = {
    recruiter_name: string | null;
    recruiter_profile_url: string | null;
    job_description: string | null;
    job_poster_name?: string | null;
    job_poster_title?: string | null;
    job_poster_profile_url?: string | null;
    company_linkedin_url?: string | null;
    company_id?: string | null;
    number_of_applications?: string | null;
    employment_type?: string | null;
    seniority_level?: string | null;
    job_function?: string | null;
    industries?: string | null;
    salary?: string | null;
    external_apply_url?: string | null;
};

export class RecruiterScraper {
    constructor(private client: LinkedInClient) {}

    private normalizeUrl(u?: string | null) {
        if (!u) return null;
        let url = u.trim();
        if (!url) return null;
        if (url.startsWith('/')) url = `https://www.linkedin.com${url.split('?')[0]}`;
        return url.split('?')[0];
    }

    private parse(html: string): DetailExtract {
        const $ = cheerio.load(html);
        // Description
        let description = '';
        const descSelectors = [
            '.description__text',
            '.show-more-less-html__markup',
            '.jobs-description__container',
            '.jobs-description-content__text',
            '.job-details-module__content',
            'section.jobs-description',
        ];
        for (const sel of descSelectors) {
            const el = $(sel).first();
            if (el.length) { description = el.text().replace(/\s+/g,' ').trim(); if (description) break; }
        }
        if (!description) description = $('section').first().text().replace(/\s+/g,' ').trim();
        description = description.slice(0, 2000);

        // Job poster / recruiter
        let recruiter_name: string | null = null;
        let recruiter_profile_url: string | null = null;
        let job_poster_name: string | null = null;
        let job_poster_title: string | null = null;
        let job_poster_profile_url: string | null = null;

        const posterAreas = [
            'div.jobs-poster__container',
            'li.jobs-poster__resume-trigger',
            'div.jobs-poster',
            'section.jobs-poster',
            'div.jobs-poster__content',
            '.jobs-unified-top-card__content--two-pane',
        ];
        for (const sel of posterAreas) {
            const area = $(sel);
            if (!area.length) continue;
            const link = area.find('a[href*="/in/"]').first();
            const nameEl = area.find('.jobs-poster__name, .jobs-poster__text, .t-14.t-black--light').first();
            const titleEl = area.find('.jobs-poster__title, .t-12.t-black--light').first();
            if (link.length) {
                const url = this.normalizeUrl(link.attr('href'));
                const nameText = (nameEl.text() || link.text() || '').replace(/\s+/g,' ').trim();
                const titleText = (titleEl.text() || '').replace(/\s+/g,' ').trim() || null;
                recruiter_name = recruiter_name || (nameText || null);
                recruiter_profile_url = recruiter_profile_url || url;
                job_poster_name = job_poster_name || recruiter_name;
                job_poster_title = job_poster_title || titleText;
                job_poster_profile_url = job_poster_profile_url || recruiter_profile_url;
                break;
            }
        }
        if (!recruiter_name) {
            $('a[href*="/in/"]').each((_i,a) => {
                if (recruiter_name) return;
                const link = $(a);
                const txt = link.text().replace(/\s+/g,' ').trim();
                if (txt && /^[A-Z][\p{L}\.'-]+(?:\s+[A-Z][\p{L}\.'-]+){0,3}$/u.test(txt)) {
                    recruiter_name = txt;
                    recruiter_profile_url = this.normalizeUrl(link.attr('href'));
                }
            });
        }

        // Company link and id
        let company_linkedin_url: string | null = null;
        let company_id: string | null = null;
        const companyLink = $('a.topcard__org-name-link, a[href*="/company/"]').first();
        if (companyLink.length) {
            company_linkedin_url = this.normalizeUrl(companyLink.attr('href'));
            const m = company_linkedin_url?.match(/\/company\/(?:[A-Za-z0-9-]+|urn:li:fsd_company:(\d+))(?:\/(?:life|posts))?/);
            if (m && m[1]) company_id = m[1];
        }

        // Number of applicants
        let number_of_applications: string | null = null;
        const applicantsSel = [
            '.num-applicants__caption',
            '.jobs-unified-top-card__subtitle-secondary .t-black--light',
            'span:contains("applicant")',
        ];
        for (const sel of applicantsSel) {
            const el = $(sel).first();
            if (el.length && /applicant/i.test(el.text())) {
                number_of_applications = el.text().replace(/\s+/g,' ').trim();
                break;
            }
        }

        // Job criteria
        let employment_type: string | null = null;
        let seniority_level: string | null = null;
        let job_function: string | null = null;
        let industries: string | null = null;
        const criteriaAreas = [
            '.description__job-criteria-list',
            '.jobs-unified-top-card__job-insight',
            '.jobs-box__html-content',
            'section.jobs-description',
        ];
        for (const sel of criteriaAreas) {
            const area = $(sel);
            if (!area.length) continue;
            const text = area.text().replace(/\s+/g,' ').trim();
            const pick = (label: RegExp) => {
                const m = text.match(new RegExp(label.source + '\\s*:?\\s*([^|•\n]+)', 'i'));
                return m ? m[1].trim() : null;
            };
            employment_type = employment_type || pick(/Employment type/);
            seniority_level = seniority_level || pick(/Seniority level/);
            job_function = job_function || pick(/Job function/);
            industries = industries || pick(/Industries?/);
        }

        // Salary
        let salary: string | null = null;
        const salaryHints = $('*:contains("salary"), *:contains("compensation")').filter((_i, el) => /salary|compensation/i.test($(el).text())).first();
        if (salaryHints.length) {
            salary = salaryHints.text().replace(/\s+/g,' ').trim().slice(0, 200);
        }

        // External apply URL
        let external_apply_url: string | null = null;
        $('a[href]').each((_i,a) => {
            const href = $(a).attr('href') || '';
            const txt = $(a).text();
            if (!href) return;
            const isExternal = !/linkedin\.com/i.test(href) && /apply|careers|jobs|company|boards|workday|greenhouse|lever/i.test(href + ' ' + txt);
            if (isExternal) { external_apply_url = href; return false; }
        });

        return {
            recruiter_name: recruiter_name || null,
            recruiter_profile_url: recruiter_profile_url || null,
            job_description: description || null,
            job_poster_name,
            job_poster_title,
            job_poster_profile_url,
            company_linkedin_url,
            company_id,
            number_of_applications,
            employment_type,
            seniority_level,
            job_function,
            industries,
            salary,
            external_apply_url,
        };
    }

    async scrape(params: RecruiterScrapeParams): Promise<Map<string, DetailExtract>> {
        const { jobs, concurrency } = params;
        const queue = await Apify.openRequestQueue();
        for (const j of jobs) {
            await queue.addRequest({ url: j.job_url, uniqueKey: j.job_url, userData: { type: 'DETAIL', job_url: j.job_url }});
        }
        const map = new Map<string, DetailExtract>();
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