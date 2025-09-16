export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    datePosted: Date; // canonical
    // New optional alternative field used by parsers
    postedDate?: Date | string; // alias input, normalized later
    url: string;
    employmentType?: string;
    salaryRange?: string;
    salary?: string; // added to satisfy parser usage
    skills?: string[];
    recruiterId?: string;
    recruiterName?: string; // enrichment
    recruiterLinkedIn?: string; // enrichment
}

export interface BaseJob {
    job_title: string | null;
    company_name: string | null;
    job_url: string;
    location: string | null;
    publication_date: string | null;
    job_description: string | null;
    keyword: string;
    scraped_at: string;
}

export interface EnrichedJob extends BaseJob {
    recruiter_name: string | null;
    recruiter_profile_url: string | null;
}