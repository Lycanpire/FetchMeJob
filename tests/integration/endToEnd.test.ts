import { Actor } from 'apify';
import { JobScraper } from '../../src/services/jobScraper';
import { RecruiterScraper } from '../../src/services/recruiterScraper';

describe('End-to-End LinkedIn Job Scraper Tests', () => {
    let jobScraper: JobScraper;
    let recruiterScraper: RecruiterScraper;

    beforeAll(async () => {
        jobScraper = new JobScraper();
        recruiterScraper = new RecruiterScraper();
    });

    test('should scrape job postings successfully', async () => {
        const jobs = await jobScraper.scrapeJobs();
        expect(jobs).toBeDefined();
        expect(Array.isArray(jobs)).toBe(true);
        expect(jobs.length).toBeGreaterThan(0);
    });

    test('should scrape recruiter information successfully', async () => {
        const recruiters = await recruiterScraper.scrapeRecruiters();
        expect(recruiters).toBeDefined();
        expect(Array.isArray(recruiters)).toBe(true);
        expect(recruiters.length).toBeGreaterThan(0);
    });

    afterAll(async () => {
        await jobScraper.close();
        await recruiterScraper.close();
    });
});