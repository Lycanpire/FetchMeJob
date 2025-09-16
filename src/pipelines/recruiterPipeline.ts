import { Recruiter } from '../types/recruiter';
import { normalizeRecruiterData } from '../transforms/normalizers';

export const recruiterPipeline = async (recruiters: Recruiter[]): Promise<Recruiter[]> => {
    const normalizedRecruiters = recruiters.map(normalizeRecruiterData);
    // Additional processing can be added here, such as deduplication or filtering
    return normalizedRecruiters;
};