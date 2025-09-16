"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const apify_1 = __importDefault(require("apify"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_writer_1 = require("csv-writer");
const logger_1 = require("../logging/logger");
class StorageService {
    saveJobs(jobs) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const j of jobs)
                yield apify_1.default.pushData(j);
            logger_1.log.info(`Saved ${jobs.length} jobs to dataset.`);
        });
    }
    exportCsv(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataset = yield apify_1.default.openDataset();
            const { items } = yield dataset.getData();
            if (!items.length) {
                logger_1.log.warning('No items to export.');
                return;
            }
            const outDir = 'output';
            if (!fs_1.default.existsSync(outDir))
                fs_1.default.mkdirSync(outDir);
            const filePath = path_1.default.join(outDir, filename);
            const header = [
                'job_title', 'company_name', 'job_url', 'location', 'publication_date', 'job_description',
                'recruiter_name', 'recruiter_profile_url', 'job_poster_name', 'job_poster_title', 'job_poster_profile_url',
                'company_linkedin_url', 'company_id', 'number_of_applications', 'employment_type', 'seniority_level', 'job_function', 'industries', 'salary', 'external_apply_url',
                'scraped_at', 'keyword'
            ].map(h => ({ id: h, title: h }));
            const writer = (0, csv_writer_1.createObjectCsvWriter)({ path: filePath, header });
            yield writer.writeRecords(items);
            const kv = yield apify_1.default.openKeyValueStore();
            yield kv.setValue(filename, fs_1.default.readFileSync(filePath), { contentType: 'text/csv' });
            logger_1.log.info(`CSV exported (${items.length} rows) -> KeyValueStore key: ${filename}`);
        });
    }
}
exports.StorageService = StorageService;
