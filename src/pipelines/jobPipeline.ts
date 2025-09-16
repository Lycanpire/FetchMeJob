import { Job } from '../types/job';
import { normalizeJobData } from '../transforms/normalizers';
import { log } from '../logging/logger';

export const jobPipeline = async (jobs: Job[]): Promise<Job[]> => {
    log.info('Starting job pipeline processing');

    const uniqueJobs = new Map<string, Job>();

    for (const job of jobs) {
        if (!uniqueJobs.has(job.id)) {
            const normalizedJob = normalizeJobData(job);
            uniqueJobs.set(job.id, normalizedJob);
            log.info(`Job processed: ${job.title}`);
        } else {
            log.warning(`Duplicate job found: ${job.title}`);
        }
    }

    log.info('Job pipeline processing completed');
    return Array.from(uniqueJobs.values());
};