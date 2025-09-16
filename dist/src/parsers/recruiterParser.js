"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRecruiterData = void 0;
function parseRecruiterData(recruiterElement) {
    const id = recruiterElement.getAttribute('data-id');
    const name = recruiterElement.querySelector('.recruiter-name').textContent.trim();
    const title = recruiterElement.querySelector('.recruiter-title').textContent.trim();
    const company = recruiterElement.querySelector('.recruiter-company').textContent.trim();
    const location = recruiterElement.querySelector('.recruiter-location').textContent.trim();
    const profileUrl = recruiterElement.querySelector('.recruiter-profile-link').getAttribute('href');
    return {
        id,
        name,
        title,
        company,
        location,
        profileUrl,
    };
}
exports.parseRecruiterData = parseRecruiterData;
