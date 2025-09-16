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
exports.postJson = exports.getJson = exports.makeRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const makeRequest = (url, options = {}, retries = MAX_RETRIES) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)(url, options);
        return response.data;
    }
    catch (error) {
        if (retries > 0) {
            yield new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return (0, exports.makeRequest)(url, options, retries - 1);
        }
        throw error;
    }
});
exports.makeRequest = makeRequest;
const getJson = (url, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.makeRequest)(url, Object.assign(Object.assign({}, options), { headers: Object.assign({ 'Accept': 'application/json' }, (options.headers || {})) }));
});
exports.getJson = getJson;
const postJson = (url, data, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.makeRequest)(url, Object.assign(Object.assign({}, options), { method: 'POST', data, headers: Object.assign({ 'Content-Type': 'application/json' }, (options.headers || {})) }));
});
exports.postJson = postJson;
