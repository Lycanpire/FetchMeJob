import { parseRecruiterData } from '../../src/parsers/recruiterParser';
import { Recruiter } from '../../src/types/recruiter';

describe('Recruiter Parser', () => {
    it('should parse recruiter information correctly', () => {
        const html = `<div class="recruiter">
                        <h2 class="name">John Doe</h2>
                        <p class="title">Senior Recruiter</p>
                        <a class="linkedin" href="https://linkedin.com/in/johndoe">Profile</a>
                      </div>`;
        
        const expectedRecruiter: Recruiter = {
            name: 'John Doe',
            title: 'Senior Recruiter',
            profileUrl: 'https://linkedin.com/in/johndoe'
        };

        const result = parseRecruiterData(html);
        expect(result).toEqual(expectedRecruiter);
    });

    it('should return null for invalid HTML structure', () => {
        const invalidHtml = `<div class="invalid-recruiter"></div>`;
        const result = parseRecruiterData(invalidHtml);
        expect(result).toBeNull();
    });
});