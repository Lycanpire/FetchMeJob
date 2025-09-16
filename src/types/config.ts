export interface Config {
  proxy: {
    useProxy: boolean;
    proxyUrls: string[];
  };
  api: {
    baseUrl: string;
    jobEndpoint: string;
    recruiterEndpoint: string;
  };
  default: {
    maxResults: number;
    timeout: number;
  };
}
