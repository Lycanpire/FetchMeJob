import { parseJobData } from '../../src/parsers/jobParser';
import { Job } from '../../src/types/job';

describe('Job Parser', () => {
    it('should correctly parse job data from API response', () => {
        const apiResponse = {
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'Remote',
            description: 'Develop and maintain software applications.',
            postedDate: '2023-10-01',
            applyLink: 'https://example.com/apply'
        };

        const expectedJob: Job = {
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'Remote',
            description: 'Develop and maintain software applications.',
            postedDate: new Date('2023-10-01'),
            applyLink: 'https://example.com/apply'
        };

        const parsedJob = parseJobData(apiResponse);
        expect(parsedJob).toEqual(expectedJob);
    });

    it('should handle missing fields gracefully', () => {
        const apiResponse = {
            title: 'Software Engineer',
            company: 'Tech Company',
            location: null,
            description: 'Develop and maintain software applications.',
            postedDate: '2023-10-01',
            applyLink: 'https://example.com/apply'
        };

        const expectedJob: Job = {
            title: 'Software Engineer',
            company: 'Tech Company',
            location: 'Not specified',
            description: 'Develop and maintain software applications.',
            postedDate: new Date('2023-10-01'),
            applyLink: 'https://example.com/apply'
        };

        const parsedJob = parseJobData(apiResponse);
        expect(parsedJob).toEqual(expectedJob);
    });
});