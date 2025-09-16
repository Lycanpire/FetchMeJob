import 'dotenv/config'; // load env vars early
import Apify from 'apify';
import { InputValidator } from './validation/inputValidator';
import { ProxyFactory } from './utils/proxy';
import { LinkedInClient } from './services/linkedinClient';
import { JobScraper } from './services/jobScraper';
import { RecruiterScraper } from './services/recruiterScraper';
import { StorageService } from './services/storageService';
import { log } from './logging/logger';
import { BaseJob, EnrichedJob } from './types/job';

Apify.main(async () => {
    const raw = (await Apify.getInput()) || {};
    const rawInput = (typeof raw === 'object' && !Array.isArray(raw) ? raw : {}) as any; // ensure object
    const input = InputValidator.validate(rawInput);

    const {
        keywords,
        location,
        maxResults,
        includeRecruiterInfo,
        proxy,
        minDelayMs,
        maxDelayMs,
        maxRetries,
        concurrency,
        searchFilters
    } = input;

    log.info(`Input: keywords=${keywords.join('|')} location="${location}" maxResults=${maxResults} recruiter=${includeRecruiterInfo}`);

    const proxyUrl = ProxyFactory.resolve(proxy);
    if (proxyUrl) {
        log.info(`Using proxy (${proxyUrl.includes('lum-superproxy') ? 'Brightdata' : proxyUrl})`);
    } else {
        log.warning('No proxy configured. Risk of rapid blocking.');
    }

    const client = new LinkedInClient({ proxyUrl, minDelayMs, maxDelayMs, maxRetries });
    const jobScraper = new JobScraper(client);
    const recruiterScraper = new RecruiterScraper(client);
    const storage = new StorageService();

    // 1. Collect base job data
    const baseJobs: BaseJob[] = await jobScraper.scrape({
        keywords,
        location,
        maxResults,
        searchFilters,
        concurrency
    });

    log.info(`Base jobs scraped: ${baseJobs.length}`);

    // 2. Optionally enrich recruiter info
    let finalJobs: (BaseJob | EnrichedJob)[] = baseJobs;
    if (includeRecruiterInfo) {
        const recruiterMap = await recruiterScraper.scrape({ jobs: baseJobs, concurrency });
        finalJobs = baseJobs.map(j => {
            const r = recruiterMap.get(j.job_url) || {} as any;
            return {
                ...j,
                recruiter_name: r.recruiter_name ?? null,
                recruiter_profile_url: r.recruiter_profile_url ?? null,
                job_description: r.job_description ?? j.job_description ?? null,
                job_poster_name: r.job_poster_name ?? null,
                job_poster_title: r.job_poster_title ?? null,
                job_poster_profile_url: r.job_poster_profile_url ?? null,
                company_linkedin_url: r.company_linkedin_url ?? null,
                company_id: r.company_id ?? null,
                number_of_applications: r.number_of_applications ?? null,
                employment_type: r.employment_type ?? null,
                seniority_level: r.seniority_level ?? null,
                job_function: r.job_function ?? null,
                industries: r.industries ?? null,
                salary: r.salary ?? null,
                external_apply_url: r.external_apply_url ?? null,
            } as EnrichedJob;
        });
        log.info(`Enriched recruiter metadata for ${recruiterMap.size} jobs.`);
    } else {
        // ensure fields present as null to satisfy CSV aggregation requirement
        finalJobs = baseJobs.map(j => ({
            ...j,
            recruiter_name: null,
            recruiter_profile_url: null,
        } as EnrichedJob));
    }

    // 3. Persist
    await storage.saveJobs(finalJobs);
    await storage.exportCsv('jobs.csv');

    log.info(`Actor finished. Total output jobs: ${finalJobs.length}`);
});