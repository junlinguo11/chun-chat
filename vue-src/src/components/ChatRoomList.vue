<template>
    <tab-container>
        <v-list class="list" two-line>
            <v-subheader class="grey--text text--lighten-4">Chats</v-subheader>
            <template v-for="(chatRoom, index) in chatRooms">
                <v-list-tile
                    avatar
                    :key="chatRoom._id"
                    @click="startChat(chatRoom._id)"
                    :class="{'blue-grey darken-2': isCurrentChat(chatRoom._id)}"
                    @contextmenu="show($event, chatRoom._id, index)">
                    <v-list-tile-avatar>
                        <img v-bind:src="chatRoom.recipient.avatar">
                    </v-list-tile-avatar>
                    <v-list-tile-content class="grey--text text--lighten-4">
                        <v-list-tile-title v-text="chatRoom.recipient.username"></v-list-tile-title>
                        <v-list-tile-sub-title v-text="getLastestMessage(chatRoom)"></v-list-tile-sub-title>
                    </v-list-tile-content>
                    <v-list-tile-action v-if="!isCurrentChat(chatRoom._id)">
                        <v-icon v-if="chatRoom.hasUnreadMessage" :class="{'green--text': chatRoom.hasUnreadMessage}">mdi-message-text</v-icon>
                    </v-list-tile-action>
                </v-list-tile>
                <v-divider v-if="index != (chatRoom.length-1)" inset :key="index"></v-divider>
            </template>
        </v-list>

        <v-menu class="right-click" offset-y v-model="showMenu" :position-x="x" :position-y="y">
            <v-list>
                <v-list-tile @click="deleteChatRoom">
                    <v-list-tile-title>删除</v-list-tile-title>
                </v-list-tile>
            </v-list>
        </v-menu>
    </tab-container>
</template>
<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import { ADD_CHATROOM, SELECT_CHATROOM, UNSELECT_CHATROOM, START_CHATTING, STOP_CHATTING, RECEIVE_NEW_MESSAGE, RECEIVE_NEW_MESSAGE_IN_OTHER_ROOM, HAS_UNREAD_MESSAGE } from '../vuex/mutation-types';
    import TabContainer from './TabContainer';

    export default {
        name: 'chatlist',
        components: {
            TabContainer,
        },
        data() {
            return {
                showMenu: false,
                x: 0,
                y: 0,
                chatRoomToDelete: {},
                chatRoomToDeleteIndex: 0,
                titleTimer: 0,
                title: '收到新消息~',
                text: '收到新消息~'
            }
        },
        computed: {
            ...mapState('user', ['user']),
            ...mapState('chatRoom', ['chatRooms', 'selectedChatRoom'])
        },
        methods: {
            show: function(e, chatRoomId, index) {
                e.preventDefault();

                this.x = e.clientX;
                this.y = e.clientY;

                this.$nextTick(() => {
                    this.showMenu = true;
                })
                this.chatRoomToDelete = chatRoomId;
                this.chatRoomToDeleteIndex = index;
            },
            startChat: function(chatRoomId) {
                this.selectChatRoom({ chatRoomId });
                this.startChatting();
                window.clearTimeout(this.titleTimer);
                document.title = `纯聊|${this.user.username}`;
            },
            isCurrentChat: function(chatRoomId) {
                return this.selectedChatRoom._id === chatRoomId;
            },
            deleteChatRoom: function() {
                if(this.chatRoomToDelete) {
                    this.deleteChatRoomById(this.chatRoomToDelete)
                        .then(() => {
                            if(this.chatRoomToDelete === this.selectedChatRoom._id) {
                                this.unselectChatRoom();
                                this.stopChatting();
                            }                            
                        });                
                }
            },
            hasChatRoom: function(chatRoom) {
                let chatRoomExist = false;
                for(var i = 0; i < this.chatRooms.length; i++) {
                    if(this.chatRooms[i]._id === chatRoom._id) {
                        chatRoomExist = true;
                        break;
                    }
                }
                return chatRoomExist;
            },
            getLocalChatRoom: function(chatRoom) {
                for(var i = 0; i < this.chatRooms.length; i++) {
                    if(this.chatRooms[i]._id === chatRoom._id) {
                        return this.chatRooms[i]._id;
                    }
                }
            },
            getLastestMessage: function(chatRoom) {
                if(chatRoom.messages.length > 0) {
                    return chatRoom.messages[chatRoom.messages.length - 1].body;
                }
            },
            titleNotice: function() {
                this.title = this.text.substring(1, this.text.length) + this.text.substring(0,1);
                this.text = this.title.substring(0, this.text.length);
                document.title=`纯聊|${this.title}`;
                this.titleTimer = window.setTimeout(this.titleNotice, 400);
            },
            desktopNotice: function(username, avatar, message) {
                if (!("Notification" in window)) {
                    console.log("This browser does not support desktop notification");
                }
                else if (Notification.permission === "granted") {
                    var notification = new Notification(username, {
                        icon: avatar,
                        body: message,
                    });
                }
                else if (Notification.permission !== "denied") {
                    Notification.requestPermission(function (permission) {
                        if (permission === "granted") {
                            var notification = new Notification("Hi there!");
                        }
                    });
                }
            },
            sendDesktopNotice: function(message) {
                for(var i = 0; i < this.chatRooms.length; i++) {
                    if(message.sender === this.chatRooms[i].recipient._id) {
                        this.desktopNotice(this.chatRooms[i].recipient.username, this.chatRooms[i].recipient.avatar, message.body);        
                        break;
                    }
                }
            },
            ...mapMutations('chatRoom', {
                addChatRoom: ADD_CHATROOM,
                selectChatRoom: SELECT_CHATROOM,
                unselectChatRoom: UNSELECT_CHATROOM,
                startChatting: START_CHATTING,
                stopChatting: STOP_CHATTING,
                receiveNewMessage: RECEIVE_NEW_MESSAGE,
                receiveNewMessageInOtherRoom: RECEIVE_NEW_MESSAGE_IN_OTHER_ROOM,
                hasUnreadMessage: HAS_UNREAD_MESSAGE
            }),
            ...mapActions('chatRoom', [
                'deleteChatRoomById'
            ])            
        },
        sockets:{
            startChat: function(chatRoom) {
                if(!this.hasChatRoom(chatRoom)) {
                    this.addChatRoom({ chatRoom });
                    this.selectChatRoom({ chatRoomId: chatRoom._id });
                } else {
                    this.selectChatRoom({ chatRoomId: this.getLocalChatRoom(chatRoom) });
                }
                this.startChatting();
                window.clearTimeout(this.titleTimer);
                document.title = `纯聊|${this.user.username}`;
            },
            messageInNewChatRoom: function(chatRoom) {
                if(!this.hasChatRoom(chatRoom)) {
                    this.addChatRoom({ chatRoom });
                    this.hasUnreadMessage({ chatRoom });
                    this.titleNotice();
                    this.sendDesktopNotice(chatRoom.messages[0]);
                }                
            },
            message: function(message) {
                if(this.selectedChatRoom.recipient) {
                    if(this.selectedChatRoom.recipient._id === message.sender){
                        this.receiveNewMessage({ message });
                    } else {
                        this.receiveNewMessageInOtherRoom({ message });
                    }
                } else {
                    this.receiveNewMessageInOtherRoom({ message });
                    this.titleNotice();
                    this.sendDesktopNotice(message);
                }
            }
        }
    }    
</script>
<style scoped>
    .list {
        height: 100%;
        background-color: #363e47;
        overflow-y: auto;
    }

    .list__tile__sub-title {
        color: #98a9b9 !important;
    }

    .card {
        background-color: #303841 !important;
    }

    .right-click {
        position: absolute;
    }

    .menu {
        display: none !important;
    }

    ::-webkit-scrollbar {
        width: 10px;
    }
    
    ::-webkit-scrollbar-track {
        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
        /* border-radius: 10px; */
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

        .chat-room-list {
            height: calc(40 * (1vw + 1vh - 1vmin));
        }
    }
</style>

