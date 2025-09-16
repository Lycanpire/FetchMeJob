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
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobPipeline = void 0;
const normalizers_1 = require("../transforms/normalizers");
const logger_1 = require("../logging/logger");
const jobPipeline = (jobs) => __awaiter(void 0, void 0, void 0, function* () {
    logger_1.log.info('Starting job pipeline processing');
    const uniqueJobs = new Map();
    for (const job of jobs) {
        if (!uniqueJobs.has(job.id)) {
            const normalizedJob = (0, normalizers_1.normalizeJobData)(job);
            uniqueJobs.set(job.id, normalizedJob);
            logger_1.log.info(`Job processed: ${job.title}`);
        }
        else {
            logger_1.log.warning(`Duplicate job found: ${job.title}`);
        }
    }
    logger_1.log.info('Job pipeline processing completed');
    return Array.from(uniqueJobs.values());
});
exports.jobPipeline = jobPipeline;
