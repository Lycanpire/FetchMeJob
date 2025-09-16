"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyFactory = void 0;
class ProxyFactory {
    static resolve(cfg) {
        if (!cfg || cfg.useProxy === false)
            return null;
        if (cfg.proxyUrl)
            return cfg.proxyUrl;
        const user = process.env.BRIGHTDATA_USERNAME;
        const pass = process.env.BRIGHTDATA_PASSWORD;
        if (user && pass) {
            return `http://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@zproxy.lum-superproxy.io:22225`;
        }
        return null;
    }
}
exports.ProxyFactory = ProxyFactory;
