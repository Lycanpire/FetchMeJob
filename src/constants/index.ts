export const DEFAULT_JOB_SEARCH_PARAMS = {
    location: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Entry level',
};

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error occurred while fetching data.',
    PARSE_ERROR: 'Error occurred while parsing the response.',
    INVALID_INPUT: 'Invalid input parameters provided.',
};

export const API_ENDPOINTS = {
    JOB_SEARCH: 'https://api.linkedin.com/v2/jobs',
    RECRUITER_SEARCH: 'https://api.linkedin.com/v2/recruiters',
};