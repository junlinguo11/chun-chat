<template>
    <tab-container>
        <v-list class="list" two-line>
            <v-subheader class="grey--text text--lighten-4">Friend Requests</v-subheader>
            <div v-if="incomingFriendRequestsList">
                <template v-for="(incomingFriendRequest, index) in incomingFriendRequestsList">
                    <v-list-tile avatar :key="index">
                    <v-list-tile-avatar>
                        <img v-bind:src="incomingFriendRequest.avatar">
                    </v-list-tile-avatar>
                    <v-list-tile-content class="grey--text text--lighten-4">
                        <v-list-tile-title v-html="incomingFriendRequest.username"></v-list-tile-title>
                        <v-list-tile-sub-title>请求加你为好友</v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                        <span>
                            <v-btn icon class="green--text grey darken-2 mr-3" @click="agree(incomingFriendRequest, index)">
                                <v-icon>mdi-check</v-icon>
                            </v-btn>
                            <v-btn icon class="red--text grey darken-2" @click="refuse(incomingFriendRequest, index)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </span>
                    </v-list-tile-action>
                    </v-list-tile>
                    <v-divider v-if="index != (incomingFriendRequestsList.length-1)" inset :key="index"></v-divider>
                </template>
            </div>
        </v-list>
    </tab-container>
</template>
<script>
    import { mapState, mapMutations, mapGetters } from 'vuex';
    import { UPDATE_FRIEND_REQUEST, REMOVE_FRIEND_REQUEST } from '../vuex/mutation-types';
    import TabContainer from './TabContainer';

    export default {
        name: 'friendrequest',
        components: {
            TabContainer,
        },
        computed: {
            ...mapState('user', ['user']),
            ...mapGetters('user', ['incomingFriendRequestsList'])
        },
        methods: {
            agree: function(friend, index) {
                this.removeRequest(index);
                this.$socket.emit('agreeAddFriend', {uid: this.user._id, fid: friend._id});
            },
            refuse: function(friend, index) {
                this.removeRequest(index);
                this.$socket.emit('refuseAddFriend', {uid: this.user._id, fid: friend._id});
            },
            ...mapMutations('user', {
                updateRequest: UPDATE_FRIEND_REQUEST,
                removeRequest: REMOVE_FRIEND_REQUEST
            })                        
        },
        sockets:{
            incomingFriendRequest: function(response) {
                this.updateRequest({ friendRequest: response.incomingFriendRequests });
            },
            addFriend: function(response) {
                 this.updateRequest({ friendRequest: response.updatedIncomingFriendRequestList.incomingFriendRequests} );
            },
            refuseAddFriend: function(response) {
                this.updateRequest({ friendRequest: response.updatedIncomingFriendRequestList.incomingFriendRequests });
            }
        }
    }    
</script>
<style scoped>
    .friend-request-list {
        width: 18vmax;
    }

    .list {
        height: 40vmax;
        background-color: #363e47;
        overflow-y: auto;
    }

    .list__tile__sub-title {
        color: #98a9b9 !important;
    }

    .card {
        background-color: #303841 !important;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
    }
    
    ::-webkit-scrollbar-thumb {
        border-radius: 10px;
        background-color: rgb(86, 91, 97);
        -webkit-box-shadow: inset 0 0 1px rgba(255,255,255,0.6); 
    }

    @supports (-ms-ime-align:auto) {
        #inspire {
            width: calc(18 * (1vw + 1vh - 1vmin));
            min-height: calc(40 * (1vw + 1vh - 1vmin));
        }

        .friend-request-list {
            height: calc(40 * (1vw + 1vh - 1vmin));
        }
    }
</style>

