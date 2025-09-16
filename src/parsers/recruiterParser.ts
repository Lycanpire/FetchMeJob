export interface Recruiter {
    id: string;
    name: string;
    title: string;
    company: string;
    location: string;
    profileUrl: string;
    contactInfo?: {
        email?: string;
        phone?: string;
    };
}

export function parseRecruiterData(recruiterElement: any): Recruiter {
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