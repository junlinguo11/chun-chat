<template>
    <v-app class="chat-room">
        <v-layout align-start>
            <v-layout class="vertical-bar">
                <v-flex>
                    <v-card>
                        <vue-tabs
                            active-tab-color="#363e47" 
                            active-text-color="white"
                            type="pills"
                            :start-index="1"
                            direction="vertical"
                            class="tab1"
                            @tab-change="handleTabChange"
                        >
                            <v-tab icon="mdi mdi-account">
                                <profile :user="user"></profile>
                            </v-tab>
                            <v-tab :icon="messageIcon">
                                <chat-room-list :user="user"></chat-room-list>
                            </v-tab>
                            <v-tab icon="mdi mdi-account-multiple-plus">
                                <friend-request :user="user"></friend-request>
                            </v-tab>                    
                            <v-tab icon="mdi mdi-account-multiple">
                                <friends-list :user="user"></friends-list>
                            </v-tab>
                            <v-tab icon="mdi mdi-magnify">
                                <search-friend :user="user"></search-friend>
                            </v-tab>         
                        </vue-tabs>
                        <div class='bottom-btn'>
                            <v-btn icon class="pink--text logout-btn" @click="logout">
                                <v-icon>mdi-power</v-icon>
                            </v-btn>
                        </div>
                    </v-card>
                </v-flex>
            </v-layout>    
            <chat-box
                @videoOffer="handleVideoCall"
                @videoCall="handleVideoCall"
                @video="handleVideo"
                @receiveVideo="handleVideo" />
            <friend-profile v-if="isActive"></friend-profile>
        </v-layout>
        <video-card
            v-if="showVideoCard"
            :request="videoRequest"
            :response="videoResponse"
            :srcObject="videoSrcObject" />
        <v-snackbar top v-model="showHint" :timeout="timeout" color="primary">
            {{newFriendRequestHint}}
            <v-btn icon class="pink--text" @click.native="showHint = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-snackbar>
    </v-app>
</template>
<script>
import { logout } from '@/api/user';
import { delCookie } from '@/utils/cookie';
import eventBus from '@/eventBus';
import Profile from './Profile.vue';
import ChatRoomList from './ChatRoomList.vue';
import ChatBox from './ChatBox.vue';
import FriendsList from './FriendsList.vue';
import SearchFriend from './SearchFriend.vue';
import FriendProfile from './FriendProfile.vue';
import FriendRequest from './FriendRequest.vue';
import VideoCard from './VideoCard';
import { mapState, mapMutations, mapActions } from 'vuex';
import { RESET_USER, RESET_CHATROOMS } from '../vuex/mutation-types';

export default {
    name: 'chatroom',
    components: {
        Profile,
        ChatBox,
        FriendsList,
        SearchFriend,
        FriendProfile,
        ChatRoomList,
        FriendRequest,
        VideoCard,
    },
    data() {
        return {
            timeout: 5000,
            showHint: false,
            newFriendRequestHint: '',
            messageIcon: 'mdi mdi-message-text',
            currentTabIndex: 0,
            friendTimer: 0,
            showVideoCard: false,
            videoRequest: {},
            videoResponse: {},
            videoSrcObject: null,
        }
    },
    computed: {
        ...mapState('user', ['user']),
        ...mapState('chatRoom', {
            chatRooms: 'chatRooms',
            selectedChatRoom: 'selectedChatRoom',
            isActive: 'isChatting',
        }),
    },
    created() {
        eventBus.$on('hangup', this.handleHangup);
    },
    methods: {
        handleTabChange: function(tabIndex) {
            this.currentTabIndex = tabIndex;
            if(this.messageIcon === 'mdi mdi-forum' && tabIndex === 1) {
                this.messageIcon = 'mdi mdi-message-text';
            }
        },
        updateFriendsInfo: function() {
            this.friendTimer = setInterval(() => {
                this.getUpdatedFriends();
            }, 1200000);
        },
        logout: function() {
            logout()
                .then((data) => {
                    if(data.isLogout) {
                        delCookie('awesome');
                        this.resetUser();
                        this.resetChatRooms();
                        clearInterval(this.friendTimer);

                        this.$router.push('/login');
                    }
                });
        },
        handleVideo(stream) {
            this.videoSrcObject = stream;
            this.showVideoCard = true;
        },
        handleVideoCall(payload) {
            this.videoRequest = payload;
            this.showVideoCard = true;
        },
        handleHangup() {
            this.videoSrcObject = null;
            this.showVideoCard = false;
        },
        ...mapActions('user', [
            'getUpdatedFriends'
        ]),
        ...mapMutations('user', {
            resetUser: RESET_USER
        }),
        ...mapMutations('chatRoom', {
            resetChatRooms: RESET_CHATROOMS
        }),
    },
    sockets:{
        incomingFriendRequest: function(response) {
            this.newFriendRequestHint = `收到${response.incomingFriendRequests.length}个好友请求`;
            this.showHint = true;
        },
        message: function(message) {
            if(this.currentTabIndex !== 1) {
                if(!this.selectedChatRoom.recipient || this.selectedChatRoom.recipient._id !== message.sender) {
                    this.messageIcon = 'mdi mdi-forum';
                }                
            }
        },
        messageInNewChatRoom: function() {
            if(this.currentTabIndex !== 1) {
                this.messageIcon = 'mdi mdi-forum';
            }
        },
        // videoRequest(request) {
        //     console.log(request);
        //     this.videoRequest = request;
        //     this.showVideoCard = true;
        // },
        // videoResponse(response) {
        //     console.log('hi', response);
        //     this.videoResponse = response;
        //     this.showVideoCard = true;
        // },
    },
    mounted() {
        if(this.user._id) {
            this.updateFriendsInfo();
        }
    }
}
</script>
<style scope>
    .chat-room {
        padding-top: 5vmin;
        padding-left: 10vmin;
        display: flex;    
    }
    .vertical-bar {
        width: 23vmax;
        height: 40vmax;
        min-height: 40vmax;
        flex-grow: 0;
    }

    .left-vertical-tabs {
        width: 5vmax;
    }

    .tab .mdi {
        font-size: 4vmin;
    }

    .mdi-forum {
        color: green;
        animation: blink .5s linear alternate infinite;
    }

    @keyframes blink {
        0% { transform: scale(1);}
        50% { transform: scale(1.1);}
        100% { transform: scale(1.2);}
    }   

    li.tab {
        background-color: #303841;
        margin-top: 0 !important;
    }
    li.tab a:hover {
        background-color: #47525f !important;
    }
    .vue-tabs a {
        color: #a5b5c1;
        border-radius: 0 !important;
    }

    .vue-tabs ul {
        min-height: 40vmax;
        background-color: #303841;
    }

    .bottom-btn {
        width: 5vmax;
        min-height: 20vmax;
        float: left;
        position: relative;
        background-color: rgba(0);;
        margin-top: -20vmax;
    }

    .logout-btn, .logout-btn:hover {
        position: absolute;
        bottom: 5vmin;
        left: 0; 
        right: 0;
        width: 36px;
        margin: 0 auto;
    }

    @supports (-ms-ime-align:auto) {
        .vertical-bar {
            width: calc(23 * (1vw + 1vh - 1vmin));
            height: calc(40 * (1vw + 1vh - 1vmin));
            flex: 0;
        }

        .left-vertical-tabs {
            width: calc(5 * (1vw + 1vh - 1vmin));
        }

        .vue-tabs ul {
            min-height: calc(40 * (1vw + 1vh - 1vmin));
        }

        .bottom-btn {
            width: calc(5 * (1vw + 1vh - 1vmin));
            min-height: calc(20 * (1vw + 1vh - 1vmin));
            margin-top: calc(-20 * (1vw + 1vh - 1vmin));
        }
    }

    @media (min-width: 1450px) {
        .vue-tabs .nav > li > a{
            padding: 1vmin 1.5vmin;
        }
    }

    @media (max-width: 1450px) {
        .vue-tabs .nav > li > a{
            padding: 5px;
        }
    }
    @media (max-width: 1020px) {
        .vue-tabs .nav > li > a{
            padding: 2px;
        }
    }
</style>

