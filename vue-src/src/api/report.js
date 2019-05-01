import api from './index';

export function sendReport(content) {
    return api.post('/report', { content })
        .then(response => response.data)
        .catch((error) => Promise.reject(error));
}