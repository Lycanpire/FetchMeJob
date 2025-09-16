import { Job } from '../types/job';
import { Recruiter } from '../types/recruiter';

export class EnrichmentService {
    enrichJobData(job: Job, recruiter: Recruiter): Job {
        return {
            ...job,
            recruiterName: recruiter.name,
            recruiterLinkedIn: recruiter.linkedInProfile,
            recruiterId: recruiter.id,
        };
    }

    enrichJobsData(jobs: Job[], recruiters: Recruiter[]): Job[] {
        return jobs.map(job => {
            const recruiter = recruiters.find(r => (r.jobId || r.id) === job.id);
            return recruiter ? this.enrichJobData(job, recruiter) : job;
        });
    }
}