import {
    getUser,
    updateStatus,
    updateAvatar,
    getUpdatedFriends,
} from '@/api/user';
import * as types from '../mutation-types';

const namespaced = true;

const state = {
    user: {}
}

const getters = {
    friendsList: state => state.user.friends,
    incomingFriendRequestsList: state => state.user.incomingFriendRequests,
    sentFriendRequestsList: state => state.user.sentFriendRequests
}

const actions = {
    getUser: function({ commit }) {
        return getUser()
            .then((user) => {
                commit(types.GET_USER, { user });
                return user;
            })
    },
    updateStatus: function({ commit }, newStatus) {
        return updateStatus(newStatus)
                    .then((status) => commit(types.UPDATE_STATUS, { returnedStatus: status }));
    },
    updateAvatar: function({ commit }, newAvatar) {
        return updateAvatar(newAvatar)
                    .then((avatar) => commit(types.UPDATE_AVATAR, { returnedAvatar: avatar }));
    },
    getUpdatedFriends: function({ commit }) {
        return getUpdatedFriends()
                    .then((friends) => commit(types.UPDATE_FRIENDS, { returnedFriends: friends }));  
    }
}

const mutations = {
    [types.GET_USER] (state, { user }) {
        state.user = user;
    },
    [types.UPDATE_STATUS] (state, { returnedStatus }) {
        state.user.status = returnedStatus;
    },      
    [types.UPDATE_AVATAR] (state, { returnedAvatar }) {
        state.user.avatar = returnedAvatar;
    },
    [types.UPDATE_FRIENDS] (state, { returnedFriends }) {
        state.user.friends = returnedFriends;
    }, 
    [types.UPDATE_FRIEND_REQUEST] (state, { friendRequest }) {
        if(friendRequest) {
            state.user.incomingFriendRequests = friendRequest;   
        } else {
            state.user.incomingFriendRequests = [];
        }
    },        
    [types.REMOVE_FRIEND_REQUEST] (state, { requestIndex }) {
        state.user.incomingFriendRequests.splice(requestIndex, 1);
    },   
    [types.RESET_USER] (state) {
        state.user = {};
    },  
}

export default {
    namespaced,
    state,
    getters,
    actions,
    mutations    
}