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
            const r = recruiterMap.get(j.job_url);
            return {
                ...j,
                recruiter_name: r?.recruiter_name || null,
                recruiter_profile_url: r?.recruiter_profile_url || null,
                job_description: r?.job_description || j.job_description || null,
            } as EnrichedJob;
        });
        log.info(`Enriched recruiter metadata for ${recruiterMap.size} jobs.`);
    }

    // 3. Persist
    await storage.saveJobs(finalJobs);
    await storage.exportCsv('jobs.csv');

    log.info(`Actor finished. Total output jobs: ${finalJobs.length}`);
});