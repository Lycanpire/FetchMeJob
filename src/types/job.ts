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
    // Additional fields
    company_linkedin_url?: string | null;
    company_id?: string | null;
    number_of_applications?: string | null;
    employment_type?: string | null;
    seniority_level?: string | null;
    job_function?: string | null;
    industries?: string | null;
    salary?: string | null;
    external_apply_url?: string | null;
    job_poster_name?: string | null; // alias of recruiter_name when available
    job_poster_title?: string | null;
    job_poster_profile_url?: string | null; // most important: hiring manager profile URL
}