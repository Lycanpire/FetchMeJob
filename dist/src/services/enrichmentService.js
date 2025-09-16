"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichmentService = void 0;
class EnrichmentService {
    enrichJobData(job, recruiter) {
        return Object.assign(Object.assign({}, job), { recruiterName: recruiter.name, recruiterLinkedIn: recruiter.linkedInProfile, recruiterId: recruiter.id });
    }
    enrichJobsData(jobs, recruiters) {
        return jobs.map(job => {
            const recruiter = recruiters.find(r => (r.jobId || r.id) === job.id);
            return recruiter ? this.enrichJobData(job, recruiter) : job;
        });
    }
}
exports.EnrichmentService = EnrichmentService;
