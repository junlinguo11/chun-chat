<template>
    <tab-container>
        <v-list class="friend-list" two-line>
            <v-subheader class="grey--text text--lighten-4">Friends</v-subheader>
            <template v-for="(friend, index) in friendsList">
                <v-list-tile avatar :key="friend.username" @click="startChat(friend)" :class="{'blue-grey darken-2': isSelectedFriend(friend)}">
                <v-list-tile-avatar>
                    <img v-bind:src="friend.avatar">
                </v-list-tile-avatar>
                <v-list-tile-content class="grey--text text--lighten-4">
                    <v-list-tile-title v-html="friend.username"></v-list-tile-title>
                    <v-list-tile-sub-title v-html="friend.status"></v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action v-if="!isSelectedFriend(friend)">
                    <v-icon class="grey--text text--lighten-4">mdi-message-plus</v-icon>
                </v-list-tile-action>
                </v-list-tile>
                <v-divider v-if="index != (friendsList.length-1)" inset :key="friend.username"></v-divider>
            </template>
        </v-list>
    </tab-container>
</template>
<script>
    import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
    import { UPDATE_FRIENDS } from '../vuex/mutation-types';
    import TabContainer from './TabContainer';

    export default {
        name: 'friendlist',
        components: {
            TabContainer,
        },
        data() {
            return {
                selectedFriend: {},
                chatIsStarted: false
            }
        },
        computed: {
            ...mapState('user', ['user']),
            ...mapGetters('user', ['friendsList'])
        },
        methods: {
            isSelectedFriend: function(friend) {
                return this.selectedFriend._id === friend._id;
            },
            startChat: function(friend) {
                this.selectedFriend = friend;
                this.$socket.emit('startChat', this.user._id, friend._id);
            },
            ...mapActions('user', [
                'getUpdatedFriends'
            ]),
            ...mapMutations('user', {
                getFriends: UPDATE_FRIENDS
            })
        },
        sockets:{
            addFriend: function(response) {
                if(response.updatedFriendsList.friends.length > 0) {
                    this.getUpdatedFriends({ friends: response.updatedFriendsList.friends });
                }
            },
            agreeAddFriend: function(response) {
                if(response.friendUpdatedFriendsList.friends.length > 0) {
                    this.getUpdatedFriends({ friends: response.friendUpdatedFriendsList.friends });
                }                
            }
        }
    }    
</script>
<style scoped>
    .friend-list {
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
</style>

