import { Job } from '../types/job';

export const parseJobData = (data: any): Job => {
    return {
        id: data.id || data.jobId || data.url, // ensure id
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
    } as Job;
};

export const parseJobList = (jobList: any[]): Job[] => {
    return jobList.map(job => parseJobData(job));
};