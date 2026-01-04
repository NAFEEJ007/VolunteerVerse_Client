import axios from 'axios';
import { getApiBase } from './utils/api';

// Set default baseURL for relative requests
axios.defaults.baseURL = getApiBase();

// Interceptor to rewrite any hard-coded localhost:5000 absolute URLs to the configured API base
axios.interceptors.request.use((config) => {
    try {
        if (config && typeof config.url === 'string') {
            // Replace any absolute URL that points to localhost:5000 with the runtime API base
            config.url = config.url.replace(/^https?:\/\/localhost:5000/, getApiBase());
            // Also protect against accidental double slashes
            config.url = config.url.replace(/(?<!:)\/\/+/, '/');
            // If getApiBase() had a protocol and host, ensure we didn't remove it
            if (!config.url.startsWith('http') && !config.url.startsWith('/')) {
                config.url = `${getApiBase().replace(/\/+$/,'')}/${config.url}`;
            }
        }
    } catch {
        // swallow errors here to avoid breaking requests
        // console.error('setupAxios rewrite error', e);
    }
    return config;
}, (error) => Promise.reject(error));

export default axios;
