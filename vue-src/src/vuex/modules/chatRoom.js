import {
    getChatRooms,
    deleteChatRoomById,
    checkoutOldMessages,
} from '@/api/chatRoom';
import * as types from '../mutation-types';

const namespaced = true;

const state = {
    chatRooms: [],
    selectedChatRoom: {},
    isChatting: false
}

const getters = {
    messages: state => {
        if(state.selectedChatRoom.messages) {
            return state.selectedChatRoom.messages;
        } else {
            return [];
        }
    },
    currentFriend: state => {
        if(state.selectedChatRoom.recipient) {
            return state.selectedChatRoom.recipient;
        } else {
            return {};
        }
    }
}

const actions = {
    getChatRooms: function({ commit }) {
        return getChatRooms()
                .then((chatRooms) => commit(types.GET_CHATROOMS, { chatRooms }));
    },
    deleteChatRoomById: function({ commit }, chatRoomId) {
        return deleteChatRoomById(chatRoomId)
                .then((removedChatRoom) => commit(types.DELETE_CHATROOM, { chatRoomId: removedChatRoom}))
    },
    checkoutOldMessages: function({ commit }, payload) {
        return checkoutOldMessages(payload)
        .then((response) => {
            commit(types.CONCAT_OLD_MESSAGES, { chatRoomId: payload.chatRoomId, oldMessages: response.oldMessages })
            if(response.isLast) {
                commit(types.HAS_ALL_MESSAGES, { chatRoomId: payload.chatRoomId, hasAllMsgs: response.isLast })
            }
        });  
    }
}

const mutations = {
    [types.GET_CHATROOMS] (state, { chatRooms }) {
        state.chatRooms = chatRooms;
    },
    [types.ADD_CHATROOM] (state, { chatRoom }) {
        state.chatRooms.unshift(chatRoom);
    },    
    [types.SELECT_CHATROOM] (state, { chatRoomId }) {
        // state.selectedChatRoom = state.chatRooms.find((chatRoom) => {
        //     return chatRoom._id === chatRoomId;
        // })
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i]._id === chatRoomId) {
                state.selectedChatRoom = state.chatRooms[i];
            }
        }

        if(state.selectedChatRoom.hasUnreadMessage) {
            state.selectedChatRoom.hasUnreadMessage = false;
        }
    },
    [types.UNSELECT_CHATROOM] (state) {
        state.selectedChatRoom = {};
    },    
    [types.DELETE_CHATROOM] (state, { chatRoomId }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i]._id === chatRoomId) {
                state.chatRooms.splice(i, 1);
                break;
            }
        }
    },
    [types.START_CHATTING] (state) {
        state.isChatting = true;
    },   
    [types.STOP_CHATTING] (state) {
        state.isChatting = false;
    },
    [types.SEND_MESSAGE] (state, { message }) {
        state.selectedChatRoom.messages.push(message);
        toTop(state.chatRooms, state.selectedChatRoom);
    },     
    [types.RECEIVE_NEW_MESSAGE] (state, { message }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i].recipient._id === message.sender) {
                state.chatRooms[i].messages.push(message);
                toTopWithIndex(state.chatRooms, state.chatRooms[i], i);
            }
        }
    },  
    [types.RECEIVE_NEW_MESSAGE_IN_OTHER_ROOM] (state, { message }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i].recipient._id === message.sender) {
                state.chatRooms[i].messages.push(message);
                state.chatRooms[i].hasUnreadMessage = true;
                toTopWithIndex(state.chatRooms, state.chatRooms[i], i);
            }
        }
    },
    [types.HAS_UNREAD_MESSAGE] (state, { chatRoom }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i]._id === chatRoom._id) {
                state.chatRooms[i].hasUnreadMessage = true;
            }
        }
    },
    [types.CONCAT_OLD_MESSAGES] (state, { chatRoomId, oldMessages }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i]._id === chatRoomId) {
                state.chatRooms[i].messages = oldMessages.concat(state.chatRooms[i].messages);
            }
        }
    },
    [types.HAS_ALL_MESSAGES] (state, { chatRoomId, hasAllMsgs }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i]._id === chatRoomId) {
                state.chatRooms[i].hasAllMsgs = hasAllMsgs;
            }
        }
    },
    [types.EMPTY_MESSAGES] (state, { chatRoomId }) {
        for(let i = 0; i < state.chatRooms.length; i++) {
            if(state.chatRooms[i]._id === chatRoomId) {
                state.chatRooms[i].messages = [];
                state.chatRooms[i].hasAllMsgs = false;
                break;
            }
        }        
    },    
    [types.RESET_CHATROOMS] (state) {
        state.chatRooms = [];
        state.selectedChatRoom = {};
        state.isChatting = false;        
    },                 
}

function toTop(chatRooms, target) {
    let targetIndex = chatRooms.findIndex(chatRoom => chatRoom._id === target._id);
    if (targetIndex > 0) {
        chatRooms.splice(targetIndex, 1);
        chatRooms.unshift(target);
    }    
}

function toTopWithIndex(chatRooms, target, targetIndex) {
    if (targetIndex > 0) {
        chatRooms.splice(targetIndex, 1);
        chatRooms.unshift(target);
    }    
}

export default {
    namespaced,
    state,
    getters,
    actions,
    mutations    
}