"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    proxy: {
        useProxy: true,
        proxyUrls: [
            'http://proxy1.example.com:8000',
            'http://proxy2.example.com:8000',
        ],
    },
    api: {
        baseUrl: 'https://api.linkedin.com/v2',
        jobEndpoint: '/jobs',
        recruiterEndpoint: '/recruiters',
    },
    default: {
        maxResults: 100,
        timeout: 30000,
    },
};
exports.default = config;
