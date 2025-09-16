export interface Recruiter {
    id: string;
    jobId?: string; // link to job for enrichment
    name: string;
    title: string;
    company: string;
    location: string;
    profileUrl: string;
    email?: string; // Optional field for email address
    phone?: string; // Optional field for phone number
    linkedInProfile?: string; // Optional field for LinkedIn profile URL
}