"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeRecruiterData = exports.normalizeJobData = void 0;
function normalizeJobData(jobData) {
    return {
        id: jobData.id,
        title: jobData.title || '',
        company: jobData.company || '',
        location: jobData.location || '',
        description: jobData.description || '',
        datePosted: jobData.datePosted instanceof Date ? jobData.datePosted : new Date(jobData.datePosted || Date.now()),
        url: jobData.url || '',
        employmentType: jobData.employmentType,
        salaryRange: jobData.salaryRange,
        skills: jobData.skills || [],
        recruiterId: jobData.recruiterId,
        recruiterName: jobData.recruiterName,
        recruiterLinkedIn: jobData.recruiterLinkedIn,
    };
}
exports.normalizeJobData = normalizeJobData;
function normalizeRecruiterData(recruiterData) {
    return {
        name: recruiterData.name || '',
        title: recruiterData.title || '',
        company: recruiterData.company || '',
        email: recruiterData.email || '',
        phone: recruiterData.phone || '',
        linkedInProfile: recruiterData.linkedInProfile || '',
    };
}
exports.normalizeRecruiterData = normalizeRecruiterData;
