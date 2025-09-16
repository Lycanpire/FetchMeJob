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
exports.delay = exports.rateLimit = void 0;
const limiter_1 = require("limiter");
const limiter = new limiter_1.RateLimiter({
    tokensPerInterval: 5,
    interval: 'second', // Time interval for the rate limit
});
const rateLimit = () => __awaiter(void 0, void 0, void 0, function* () {
    yield limiter.removeTokens(1); // Remove a token for each request
});
exports.rateLimit = rateLimit;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
