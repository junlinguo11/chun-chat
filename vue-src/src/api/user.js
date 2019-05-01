import api from './index';

export function getUser() {
    return api.get('/user')
        .then(response => response.user)
        .catch((error) => Promise.reject(error));
}

export function signin(userInfo) {
    return api.post('/user', userInfo)
        .then(response => response)
        .catch((error) => Promise.reject(error));
}

export function updateStatus(newStatus) {
    return api.post('/user/status', newStatus)
        .then(response => response.status.status )
        .catch((error) => Promise.reject(error));
}

export function updateAvatar(newAvatar) {
    return api.post('/user/avatar', newAvatar)
        .then(response => response.avatar.avatar)
        .catch((error) => Promise.reject(error));
}

export function getUpdatedFriends() {
    return api.get('/user/friends')
        .then(response => response.friends)
        .catch((error) => Promise.reject(error));
}

export function login(username, password) {
    return api.post('/user/login', { username, password })
        .then(response => response)
        .catch((error) => Promise.reject(error));
}

export function logout() {
    return api.post('/user/logout')
        .then(response => response)
        .catch((error) => Promise.reject(error));
}

export function uploadImage(img, config) {
    return api.post('https://api.imgur.com/3/image', img, config)
        .then(response => response)
        .catch((error) => Promise.reject(error));
}

export function searchFriend(username) {
    return api.post('/user/search', { username })
        .then(response => response)
        .catch((error) => Promise.reject(error));
}