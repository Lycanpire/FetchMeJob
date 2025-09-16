"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.API_ENDPOINTS = exports.ERROR_MESSAGES = exports.DEFAULT_JOB_SEARCH_PARAMS = void 0;
exports.DEFAULT_JOB_SEARCH_PARAMS = {
    location: 'Remote',
    jobType: 'Full-time',
    experienceLevel: 'Entry level',
};
exports.ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error occurred while fetching data.',
    PARSE_ERROR: 'Error occurred while parsing the response.',
    INVALID_INPUT: 'Invalid input parameters provided.',
};
exports.API_ENDPOINTS = {
    JOB_SEARCH: 'https://api.linkedin.com/v2/jobs',
    RECRUITER_SEARCH: 'https://api.linkedin.com/v2/recruiters',
};
