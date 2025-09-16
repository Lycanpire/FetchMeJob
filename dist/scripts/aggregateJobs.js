"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const DATASET_DIR = (0, path_1.join)(__dirname, '..', 'apify_storage', 'datasets', 'default');
const OUTPUT_DIR = (0, path_1.join)(__dirname, '..', 'output');
function loadJobs() {
    const files = (0, fs_1.readdirSync)(DATASET_DIR).filter(f => f.endsWith('.json')).sort();
    const jobs = [];
    for (const f of files) {
        try {
            const raw = (0, fs_1.readFileSync)((0, path_1.join)(DATASET_DIR, f), 'utf-8');
            const obj = JSON.parse(raw);
            jobs.push(obj);
        }
        catch (e) {
            // skip malformed
        }
    }
    return jobs;
}
function toCsv(jobs) {
    const header = ['SNo', 'job_title', 'company_name', 'location', 'publication_date', 'keyword', 'scraped_at', 'job_url',
        'recruiter_name', 'recruiter_profile_url', 'job_poster_name', 'job_poster_title', 'job_poster_profile_url',
        'company_linkedin_url', 'company_id', 'number_of_applications', 'employment_type', 'seniority_level', 'job_function', 'industries', 'salary', 'external_apply_url'];
    const lines = [header.join(',')];
    jobs.forEach((j, idx) => {
        const nv = (v) => v && String(v).trim() ? String(v) : 'null';
        const row = [
            (idx + 1).toString(),
            nv(j.job_title),
            nv(j.company_name),
            nv(j.location),
            nv(j.publication_date),
            nv(j.keyword),
            nv(j.scraped_at),
            nv(j.job_url),
            nv(j.recruiter_name),
            nv(j.recruiter_profile_url),
            nv(j.job_poster_name),
            nv(j.job_poster_title),
            nv(j.job_poster_profile_url),
            nv(j.company_linkedin_url),
            nv(j.company_id),
            nv(j.number_of_applications),
            nv(j.employment_type),
            nv(j.seniority_level),
            nv(j.job_function),
            nv(j.industries),
            nv(j.salary),
            nv(j.external_apply_url)
        ].map(v => '"' + (v.replace(/"/g, '""')) + '"');
        lines.push(row.join(','));
    });
    return lines.join('\n');
}
function main() {
    const jobs = loadJobs();
    if (!(0, fs_1.existsSync)(OUTPUT_DIR))
        (0, fs_1.mkdirSync)(OUTPUT_DIR);
    const outPath = (0, path_1.join)(OUTPUT_DIR, 'aggregated_full.csv');
    (0, fs_1.writeFileSync)(outPath, toCsv(jobs), 'utf-8');
    console.log(`Wrote ${jobs.length} rows to ${outPath}`);
}
main();
