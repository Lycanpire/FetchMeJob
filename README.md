# LinkedIn Jobs Actor

This project is an Apify actor designed for scraping job postings and recruiter information from LinkedIn. It provides a structured approach to gather and process data efficiently.

## Features

- Scrapes job postings from LinkedIn.
- Extracts recruiter information associated with job postings.
- Supports pagination for job listings.
- Implements request rate limiting and proxy management.
- Provides data enrichment services to enhance job data.
- Exports results in CSV format.

## Project Structure

```
linkedin-jobs-actor
├── src
│   ├── main.ts
│   ├── config
│   │   └── index.ts
│   ├── constants
│   │   └── index.ts
│   ├── types
│   │   ├── job.ts
│   │   ├── recruiter.ts
│   │   └── index.ts
│   ├── utils
│   │   ├── request.ts
│   │   ├── pagination.ts
│   │   ├── proxy.ts
│   │   └── rateLimiter.ts
│   ├── services
│   │   ├── linkedinClient.ts
│   │   ├── jobScraper.ts
│   │   ├── recruiterScraper.ts
│   │   ├── enrichmentService.ts
│   │   └── storageService.ts
│   ├── parsers
│   │   ├── jobParser.ts
│   │   ├── recruiterParser.ts
│   │   └── htmlUtils.ts
│   ├── validation
│   │   └── inputValidator.ts
│   ├── pipelines
│   │   ├── jobPipeline.ts
│   │   └── recruiterPipeline.ts
│   ├── transforms
│   │   └── normalizers.ts
│   └── logging
│       └── logger.ts
├── tests
│   ├── unit
│   │   ├── jobParser.test.ts
│   │   └── recruiterParser.test.ts
│   └── integration
│       └── endToEnd.test.ts
├── input_schema.json
├── apify.json
├── package.json
├── tsconfig.json
├── Dockerfile
├── .gitignore
├── .env.example
├── README.md
└── LICENSE
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd linkedin-jobs-actor
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables by copying `.env.example` to `.env` and filling in the required values.

4. Run the actor:
   ```
   npm start
   ```

## Usage

To use the actor, provide the necessary input parameters as defined in `input_schema.json`. The actor will scrape job postings and recruiter information based on the specified criteria.

## Testing

Unit tests can be run using:
```
npm test
```

Integration tests can be executed with:
```
npm run test:integration
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.