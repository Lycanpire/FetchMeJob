import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

interface JobRecord {
  job_title: string | null;
  company_name: string | null;
  job_url: string;
  location: string | null;
  publication_date: string | null;
  job_description?: string | null;
  keyword: string;
  scraped_at: string;
  recruiter_name?: string | null;
  recruiter_profile_url?: string | null;
  job_poster_name?: string | null;
  job_poster_title?: string | null;
  job_poster_profile_url?: string | null;
  company_linkedin_url?: string | null;
  company_id?: string | null;
  number_of_applications?: string | null;
  employment_type?: string | null;
  seniority_level?: string | null;
  job_function?: string | null;
  industries?: string | null;
  salary?: string | null;
  external_apply_url?: string | null;
}

const DATASET_DIR = join(__dirname, '..', 'apify_storage', 'datasets', 'default');
const OUTPUT_DIR = join(__dirname, '..', 'output');

function loadJobs(): JobRecord[] {
  const files = readdirSync(DATASET_DIR).filter(f => f.endsWith('.json')).sort();
  const jobs: JobRecord[] = [];
  for (const f of files) {
    try {
      const raw = readFileSync(join(DATASET_DIR, f), 'utf-8');
      const obj = JSON.parse(raw) as JobRecord;
      jobs.push(obj);
    } catch (e) {
      // skip malformed
    }
  }
  return jobs;
}

function toCsv(jobs: JobRecord[]) {
  const header = ['SNo','job_title','company_name','location','publication_date','keyword','scraped_at','job_url',
    'recruiter_name','recruiter_profile_url','job_poster_name','job_poster_title','job_poster_profile_url',
    'company_linkedin_url','company_id','number_of_applications','employment_type','seniority_level','job_function','industries','salary','external_apply_url'];
  const lines = [header.join(',')];
  jobs.forEach((j, idx) => {
    const nv = (v: string | null | undefined) => v && String(v).trim() ? String(v) : 'null';
    const row = [
      (idx+1).toString(),
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
    ].map(v => '"'+(v.replace(/"/g,'""'))+'"');
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

function main() {
  const jobs = loadJobs();
  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR);
  const outPath = join(OUTPUT_DIR, 'aggregated_full.csv');
  writeFileSync(outPath, toCsv(jobs), 'utf-8');
  console.log(`Wrote ${jobs.length} rows to ${outPath}`);
}

main();
