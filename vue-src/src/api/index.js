import axios from 'axios';

export default {
    get: function(url, params, config) {
        return axios.get(url, {
            params,
            ...config,
        })
        .then( response => response.data );
    },
    post: function(url, data, config) {
        return axios.post(url, data, config)
            .then( response => response.data );
    },
    delete: function(url, params, config) {
        return axios.delete(url, {
            params,
            ...config,
        })
        .then( response => response.data );
    }
}