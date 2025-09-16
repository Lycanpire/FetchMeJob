import { RateLimiter } from 'limiter';

const limiter = new RateLimiter({
    tokensPerInterval: 5, // Number of requests allowed per interval
    interval: 'second', // Time interval for the rate limit
});

export const rateLimit = async () => {
    await limiter.removeTokens(1); // Remove a token for each request
};

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));