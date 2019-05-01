import api from './index';

export function checkUniqueUserName(username) {
    return api.post('/unique-name', { username })
        .then(response => response)
        .catch((error) => { console.log(error) } );
}

export function checkUniqueEmail(email) {
    return api.post('/unique-email', { email })
        .then(response => response )
        .catch((error) => { console.log(error) } );
}