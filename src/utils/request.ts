import axios, { AxiosRequestConfig } from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

type GenericOptions = AxiosRequestConfig & { headers?: Record<string, any> };

export const makeRequest = async (url: string, options: GenericOptions = {}, retries = MAX_RETRIES): Promise<any> => {
    try {
        const response = await axios(url, options);
        return response.data;
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return makeRequest(url, options, retries - 1);
        }
        throw error;
    }
};

export const getJson = async (url: string, options: GenericOptions = {}): Promise<any> => {
    return makeRequest(url, { ...options, headers: { 'Accept': 'application/json', ...(options.headers || {}) } });
};

export const postJson = async (url: string, data: any, options: GenericOptions = {}): Promise<any> => {
    return makeRequest(url, { ...options, method: 'POST', data, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
};