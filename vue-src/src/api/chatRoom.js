import api from './index';

export function getChatRooms() {
    return api.get('/user/chat-rooms')
        .then(response => response.chatRooms)
        .catch((error) => { console.log(error) } );
}

export function deleteChatRoomById(chatRoomId) {
    return api.delete(`/user/chat-room/${chatRoomId}`)
        .then(response => response.removedChatRoom)
        .catch((error) => { console.log(error) } );
}

export function checkoutOldMessages(payload) {
    return api.get(`/user/old-messages?id=${payload.chatRoomId}&hasMsg=${payload.numOfLocalMessages}`)
        .then(response => response)
        .catch((error) => { console.log(error) } );        
}