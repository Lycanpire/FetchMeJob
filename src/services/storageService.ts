import Apify from 'apify';
import fs from 'fs';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';
import { BaseJob, EnrichedJob } from '../types/job';
import { log } from '../logging/logger';

export class StorageService {
    async saveJobs(jobs: (BaseJob | EnrichedJob)[]) {
        for (const j of jobs) await Apify.pushData(j);
        log.info(`Saved ${jobs.length} jobs to dataset.`);
    }

    async exportCsv(filename: string) {
        const dataset = await Apify.openDataset();
        const { items } = await dataset.getData();
        if (!items.length) {
            log.warning('No items to export.');
            return;
        }
        const outDir = 'output';
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
        const filePath = path.join(outDir, filename);
        const header = [
            'job_title','company_name','job_url','location','publication_date','job_description','recruiter_name','recruiter_profile_url','scraped_at','keyword'
        ].map(h => ({ id: h, title: h }));
        const writer = createObjectCsvWriter({ path: filePath, header });
        await writer.writeRecords(items);
        const kv = await Apify.openKeyValueStore();
        await kv.setValue(filename, fs.readFileSync(filePath), { contentType: 'text/csv' });
        log.info(`CSV exported (${items.length} rows) -> KeyValueStore key: ${filename}`);
    }
}