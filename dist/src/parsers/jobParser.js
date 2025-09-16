"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJobList = exports.parseJobData = void 0;
const parseJobData = (data) => {
    return {
        id: data.id || data.jobId || data.url,
        title: data.title,
        company: data.company,
        location: data.location,
        description: data.description,
        datePosted: data.datePosted || data.postedDate ? new Date(data.datePosted || data.postedDate) : new Date(),
        postedDate: data.postedDate,
        employmentType: data.employmentType,
        salary: data.salary,
        salaryRange: data.salaryRange || data.salary,
        url: data.url,
    };
};
exports.parseJobData = parseJobData;
const parseJobList = (jobList) => {
    return jobList.map(job => (0, exports.parseJobData)(job));
};
exports.parseJobList = parseJobList;
