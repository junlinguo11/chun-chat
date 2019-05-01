<template>
    <v-app class="chat-box">
    <v-card class="white chat-box-inner" flat tile>
        <v-card class="grey lighten-4 " flat tile>
            <v-card-text class="message-box" v-chat-scroll="{always: false}" 
                v-scroll="{
                    target: '.message-box',
                    callback: this.onScrollTop
                }"
                @contextmenu="isActive ? show($event) : null"
            >
                <v-container>
                    <v-layout row>
                        <v-flex xs12>
                            <v-progress-circular indeterminate v-bind:size="20" color="primary" v-show="checkoutOldMsgs"></v-progress-circular>
                            <div
                                v-for="message in messages"
                                :key="message._id"
                                :class="alignment(message)">
                                <v-avatar v-if="message.sender !== user._id" size="50px" class="grey lighten-4 mr-1"><img :src="friend.avatar" alt="avatar"></v-avatar>
                                <div :class="bubbleAlignment(message)">
                                    <div class="text">
                                        <div>{{message.body}}</div>
                                    </div>
                                </div>
                                <v-avatar v-if="message.sender === user._id" size="50px" class="grey lighten-4 ml-1"><img :src="user.avatar" alt="avatar"></v-avatar>
                            </div>
                            <div v-if="friend.avatar && friendIsTyping" class="text-xs-left friend-msg">
                                <v-avatar size="50px" class="grey lighten-4 mr-1"><img :src="friend.avatar" alt="avatar"></v-avatar>
                                <div class="bubble-left-typing">
                                    <div class="text">
                                        <div class="spinner">
                                            <div class="bounce1"></div>
                                            <div class="bounce2"></div>
                                            <div class="bounce3"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-flex>
                    </v-layout>
                </v-container>
                <v-menu class="right-click" offset-y v-model="showMenu" :position-x="x" :position-y="y">
                    <v-list>
                        <v-list-tile @click="deleteMessages">
                            <v-list-tile-title>清空</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-card-text>
        </v-card>
        <v-container v-on-clickaway="onClickAway">
            <transition
                name="fade"
            >
                <div id="emoji-panel-container" v-show="isSelecting"></div>
            </transition>
            <v-layout class="input-div" fluid justify-center align-center>
                <v-flex xs12>
                    <div class="input-inner-div">
                        <v-icon :class="{'emoji-is-active': isActive}" @click="onOpenEmojiPanel">mdi-emoticon-happy</v-icon>
                        <v-icon @click="onVideo">mdi-video</v-icon>
                        <input class="chat-input" type="text" v-model="chat" @keyup.enter="onSend" @keydown="onType" :placeholder="placeholder" :disabled="!isActive"/>
                        <v-icon @click="onSend" :class="{'send-btn-is-active': isActive}">mdi-send</v-icon>
                    </div>
                </v-flex>
            </v-layout>
        </v-container>
    </v-card>
    </v-app>
</template>
<script>
import EmojiPanel from 'emoji-panel';
import EmojiConvertor from 'emoji-js';
import { mixin as clickaway } from 'vue-clickaway';
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex';
import { SEND_MESSAGE, EMPTY_MESSAGES } from '@/vuex/mutation-types';
import { iceServer } from '@/config';
import eventBus from '@/eventBus';

export default {
    name: "chatbox",
    mixins: [ clickaway ],
    data() {
        return {
            showMenu: false,
            x: 0,
            y: 0,
            messageContainer: {},
            isTyping: false,
            typingTimeout: 0,
            friendIsTyping: false,
            chatRoom: {},
            chat: '',
            messageToBeSent: {},
            isSelecting: false,
            emoji: {},
            checkoutOldMsgs: false,
            videoRequest: null,
            videoConnection: null,
            mediaConstraints: {
                audio: true,
                video: true,
            },
            negotiating: false,
        }
    },
    computed: {
        placeholder: function() {
            return this.isActive ? '说点什么吧...' : '选择一个朋友开始聊天...';
        },
        ...mapState('user', ['user']),
        ...mapState('chatRoom', {selectedChatRoom: 'selectedChatRoom', isActive: 'isChatting'}),
        ...mapGetters('chatRoom', { messages: 'messages', friend: 'currentFriend' })
    },
    created() {
        eventBus.$on('hangup', this.closeVideoCall);
    },
    methods: {
        show: function(e) {
            e.preventDefault()
            this.showMenu = false
            this.x = e.clientX
            this.y = e.clientY
            this.$nextTick(() => {
                this.showMenu = true;
            })
        },
        onScrollTop: async function(e) {
            if(e.target.scrollTop === 0 && !this.selectedChatRoom.hasAllMsg && this.selectedChatRoom.messages.length >= 15) {
                if(this.selectedChatRoom._id && !this.selectedChatRoom.hasAllMsgs) {
                    this.checkoutOldMsgs = true;
                    let oldMessageContainerHeight = this.messageContainer.scrollHeight;
                    // this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
                    await this.checkoutOldMessages({ chatRoomId: this.selectedChatRoom._id, numOfLocalMessages: this.selectedChatRoom.messages.length});
                    this.checkoutOldMsgs = false;
                    this.messageContainer.scrollTop = this.messageContainer.scrollHeight - oldMessageContainerHeight;
                }
            }
        },  
        onType: function(e) {
            if(e.key !== 'Enter') {
                this.isTyping = true;
                this.$socket.emit('typing', this.user._id, this.friend._id, this.isTyping);
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    this.isTyping = false;
                    this.$socket.emit('typing', this.user._id, this.friend._id, this.isTyping);
                }, 1000);
            }
        },
        onOpenEmojiPanel: function() {
            if(this.isActive) {
                this.isSelecting = !this.isSelecting;
            }
        },
        onSelectEmoji: function(e) {
            //this.chat += this.emoji.replace_unified('\u{' + e.unified + '}');
            if(e.unified.length > 5) {
                this.chat += this.emoji.replace_unified(String.fromCodePoint('0x' + e.unified.substring(0,5)));
                this.chat += this.emoji.replace_unified(String.fromCodePoint('0x' + e.unified.substring(6)));
            } else {
                this.chat += this.emoji.replace_unified(String.fromCodePoint('0x' + e.unified));
            }
        },
        onClickAway: function() {
            this.isSelecting = false;
        },
        onVideo: function() {
            if (!this.isActive) return;

            if (this.videoConnection) {
                console.log('正在视频');
            } else {
                console.log('onVideo');
                this.createPeerConnection();
                this.createVideoOffer();

                return this.$emit('videoCall', { receiver: this.friend });

                // const hasAddTrack = (this.videoConnection.addTrack !== undefined);

                // navigator.mediaDevices.getUserMedia(this.mediaConstraints)
                //     .then((localStream) => {
                //         this.$emit('video', localStream);

                //         if (hasAddTrack) {
                //             localStream.getTracks().forEach(track => this.videoConnection.addTrack(track, localStream));
                //         } else {
                //             this.videoConnection.addStream(localStream);
                //         }
                //     })
                //     .catch((err) => {
                //         console.log(err);
                //     });

            }
        },
        onSend: function() {
            if(this.isActive && this.chat) {
                this.messageToBeSent = {sender: this.user._id, receiver: this.friend._id, body: this.chat};
                this.$socket.emit('message', this.messageToBeSent);
                this.sendMessage({ message: this.messageToBeSent })
                this.clear();
                this.isSelecting = false;
            }
        },
        clear: function() {
            this.chat = "";
            this.messageToBeSent = {};
        },
        alignment: function(message) {
            return message.sender === this.user._id ? 'text-xs-right self-msg':'text-xs-left friend-msg';
        },
        bubbleAlignment: function(message) {
            if(message.sender === this.user._id) {
                return 'bubble-right';
            } else {
                if(this.friend.gender === '男') {
                    return 'bubble-left-male';
                } else {
                    return 'bubble-left-female';
                }
            }
        },
        deleteMessages: function() {
            this.emptyMessages({ chatRoomId: this.selectedChatRoom._id });
        },
        createPeerConnection() {
            let hasAddTrack;
            
            this.videoConnection = new RTCPeerConnection(iceServer);

            hasAddTrack = (this.videoConnection.addTrack !== undefined);

            this.videoConnection.onicecandidate = this.handleICECandidateEvent;
            this.videoConnection.onremovestream = this.handleRemoveStreamEvent;
            this.videoConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
            this.videoConnection.onicegatheringstatechange = this.handleICEGatheringStateChangeEvent;
            this.videoConnection.onsignalingstatechange = this.handleSignalingStateChangeEvent;
            this.videoConnection.onnegotiationneeded = this.handleNegotiationNeededEvent;

            // Because the deprecation of addStream() and the addstream event is recent,
            // we need to use those if addTrack() and track aren't available.

            if (hasAddTrack) {
                this.videoConnection.ontrack = this.handleTrackEvent;
            } else {
                this.videoConnection.onaddstream = this.handleAddStreamEvent;
            }
        },
        closeVideoCall() {
            if (this.videoConnection) {
                this.videoConnection.ontrack = null;
                this.videoConnection.onremovetrack = null;
                this.videoConnection.onremovestream = null;
                this.videoConnection.onicecandidate = null;
                this.videoConnection.oniceconnectionstatechange = null;
                this.videoConnection.onsignalingstatechange = null;
                this.videoConnection.onicegatheringstatechange = null;
                this.videoConnection.onnegotiationneeded = null;

                this.videoConnection.close();
                this.videoConnection = null;
            }
        },
        handleICECandidateEvent(e) {
            if (e.candidate) {
                this.$socket.emit('iceCandidate', {
                    sender: this.user._id,
                    receiver: this.friend._id,
                    candidate: e.candidate,
                });
            }
        },
        handleRemoveStreamEvent() {},
        handleICEConnectionStateChangeEvent() {
            switch(this.videoConnection.iceConnectionState) {
                case "closed":
                case "failed":
                case "disconnected":
                    this.closeVideoCall();
                    break;
            }
        },
        handleICEGatheringStateChangeEvent() {},
        handleSignalingStateChangeEvent() {
            switch(this.videoConnection.iceConnectionState) {
                case "closed":
                    this.closeVideoCall();
                    break;
            }
        },
        handleNegotiationNeededEvent() {
            console.log('negotiationNeeded');
            if (this.videoConnection.signalingState != "stable") return;

            // this.videoConnection.createOffer()
            //     .then((offer) => {
            //         return this.videoConnection.setLocalDescription(offer);
            //     })
            //     .then(() => {
            //         this.$socket.emit('videoOffer', {
            //             sender: this.user._id,
            //             receiver: this.friend._id,
            //             sdp: this.videoConnection.localDescription,
            //         });
            //     });
        },
        handleTrackEvent(e) {
            this.$emit('receiveVideo', e.streams[0]);
        },
        handleAddStreamEvent() {},
        createVideoOffer() {
            this.videoConnection.createOffer()
                .then((offer) => {
                    return this.videoConnection.setLocalDescription(offer);
                })
                .then(() => {
                    this.$socket.emit('videoOffer', {
                        sender: this.user._id,
                        receiver: this.friend._id,
                        sdp: this.videoConnection.localDescription,
                    });
                });
        },
        ...mapActions('chatRoom', [
            'checkoutOldMessages'
        ]),
        ...mapMutations('chatRoom', {
            sendMessage: SEND_MESSAGE,
            emptyMessages: EMPTY_MESSAGES
        }),
    },
    sockets:{
        message: function(){
            this.friendIsTyping = false;
        },
        typing: function(payload) {
            if(this.selectedChatRoom.recipient) {
                if(this.selectedChatRoom.recipient._id === payload.uid) {
                    this.friendIsTyping = payload.isTyping;
                    this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
                }
            }
        },
        videoOffer(payload) {
            console.log('videoOffer');
            return this.$emit('videoOffer', payload);

            let localStream;
            let desc;

            this.createPeerConnection();

            const hasAddTrack = (this.videoConnection.addTrack !== undefined);

            desc = new RTCSessionDescription(payload.sdp);

            this.videoConnection.setRemoteDescription(desc)
                .then(() => {
                    return navigator.mediaDevices.getUserMedia(this.mediaConstraints);
                })
                .then((stream) => {
                    localStream = stream;
                    // document.getElementById("local_video").srcObject = localStream;
                    this.$emit('video', localStream);

                    if (hasAddTrack) {
                        localStream.getTracks().forEach(track =>
                            this.videoConnection.addTrack(track, localStream)
                        );
                    } else {
                        this.videoConnection.addStream(localStream);
                    }
                })
                .then(() => {
                    // Now that we've successfully set the remote description, we need to
                    // start our stream up locally then create an SDP answer. This SDP
                    // data describes the local end of our call, including the codec
                    // information, options agreed upon, and so forth.
                    console.log(this.videoConnection);
                    return this.videoConnection.createAnswer();
                })
                    .then((answer) => {
                    // We now have our answer, so establish that as the local description.
                    // This actually configures our end of the call to match the settings
                    // specified in the SDP.
                    return this.videoConnection.setLocalDescription(answer);
                })
                    .then(() => {
                        // We've configured our end of the call now. Time to send our
                        // answer back to the caller so they know that we want to talk
                        // and how to talk to us.
                        this.$socket.emit('videoAnswer', {
                            sender: this.user._id,
                            receiver: payload.sender._id,
                            sdp: this.videoConnection.localDescription,
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
        },
        videoAnswer(payload) {
            console.log('videoAnswer');
            const desc = new RTCSessionDescription(payload.sdp);

            this.videoConnection.setRemoteDescription(desc)
                .catch((err) => {
                    console.log(err);
                })
        },
        iceCandidate(payload) {
            console.log('iceCandidate', payload);
            const candidate = new RTCIceCandidate(payload.candidate);

            this.videoConnection.addIceCandidate(candidate)
                .catch((err) => {
                    console.log(err);
                });
        }
    },
    mounted() {
        this.messageContainer = this.$el.querySelector(".message-box");
        new EmojiPanel(this.$el.querySelector('#emoji-panel-container'), {onClick: this.onSelectEmoji});
        this.emoji = new EmojiConvertor();
        //this.emoji.init_env();
        this.emoji.replace_mode = 'unified';
        //this.emoji.allow_native = true;
    },
    updated() {
        if(this.chatRoom._id !== this.selectedChatRoom._id) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
            this.chatRoom = this.selectedChatRoom;
        }
        if(this.friendIsTyping) {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }
    }
}
</script>
<style scoped>
    .container {
        padding: 0;
    }

    .progress-circular {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .message-box {
        height:35vmax;
        overflow-y: auto;
    }
    
    .input-div {
        margin: 0;
        padding: 9px;
        height: 5vmax;
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translate3d(0, 10%, 0);
        }

        to {
            opacity: 1;
            transform: none;
        }
    }

    @keyframes fadeOutDown {
        from {
            opacity: 1;
        }

        to {
            opacity: 0;
            transform: translate3d(0, 10%, 0);
        }
    }

    .fade-enter-active {
        animation: fadeInUp .2s;
    }

    .fade-leave-active {
        animation: fadeOutDown .2s;
    }

    #emoji-panel-container {
        position: absolute;
        height: 250px;
        width: 358px;
        margin-top: -250px;
        left: 0;
        z-index: 2;
    }

    .chat-box {
        /* display: inline-block; */
        width: 35vmax;
        min-height: 40vmax;
        height: 40vmax;
    }

    .chat-box-inner {
        min-height:35vmax;
    }

    .right-click {
        position: absolute;
    }

    .chat-input {
        padding: 10px;
        width: 90%;
        outline: none;
        margin: 0 auto;
        font-size: 2.5vmin;
        transition: all 0.30s ease-in-out;
        border: 1px solid rgba(0, 0, 0, 0);
    }

    .chat-input:focus {
        box-shadow: 0 0 5px rgba(63, 191, 127, 0.44);
        border: 1px solid rgba(63, 191, 127, 0.44);
    }

    .chat-input::placeholder {
        color: rgba(147, 153, 150, 0.44);
    }

    .mdi-send,
    .mdi-video,
    .mdi-emoticon-happy {
        color: #9e9e9e !important;
        font-size: 2.5vmax;
    }

    .emoji-is-active {
        cursor: pointer;
    }

    .emoji-is-active:hover {
        color: #ffcc33 !important;
    }

    .send-btn-is-active {
        color: green !important;
        font-size: 2.5vmax;
        cursor: pointer;
    }

    .send-btn-is-active:hover {
        animation: spin .5s 0s infinite linear;
    }

    .input-inner-div {
        display: flex;
        width: 100%;
        justify-content: center;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(-25deg);
        }
        100% {
            transform: rotate(0deg);
        }
    }

    .spinner {
    width: 70px;
    text-align: center;
    }

    .spinner > div {
    width: 18px;
    height: 18px;
    background-color: #676464;

    border-radius: 100%;
    display: inline-block;
    -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    animation: sk-bouncedelay 1.4s infinite ease-in-out both;
    }

    .spinner .bounce1 {
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
    }

    .spinner .bounce2 {
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
    }

    @-webkit-keyframes sk-bouncedelay {
    0%, 80%, 100% { -webkit-transform: scale(0) }
    40% { -webkit-transform: scale(1.0) }
    }

    @keyframes sk-bouncedelay {
    0%, 80%, 100% { 
        -webkit-transform: scale(0);
        transform: scale(0);
    } 40% { 
        -webkit-transform: scale(1.0);
        transform: scale(1.0);
    }
    }
    .bubble-left-typing {
        display: flex;
        position: relative;
        width: 100px;
        min-height: 40px;
        padding: 0px;
        margin-left: 5px; 
        background: #BEBBBB;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;
        justify-content: center; /* align horizontal */
        align-items: center; /* align vertical */
    }

    .bubble-left-typing:after {
        content: '';
        position: absolute;
        border-style: solid;
        border-width: 5px 8px 5px 0;
        border-color: transparent #BEBBBB;
        display: block;
        width: 0;
        z-index: 1;
        margin-top: -5px;
        left: -7px;
        top: 50%;
    }

    .bubble-left-male {
        display: flex;
        position: relative;
        min-width: 50px;
        min-height: 40px;
        padding: 0px;
        margin-left: 5px; 
        background: #43A7FF;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;
        justify-content: center; /* align horizontal */
        align-items: center; /* align vertical */
    }

    .bubble-left-male:after {
        content: '';
        position: absolute;
        border-style: solid;
        border-width: 5px 8px 5px 0;
        border-color: transparent #43A7FF;
        display: block;
        width: 0;
        z-index: 1;
        margin-top: -5px;
        left: -7px;
        top: 50%;
    }

    .bubble-left-female {
        display: flex;
        position: relative;
        min-width: 50px;
        min-height: 40px;
        padding: 0px;
        margin-left: 5px; 
        background: #FF87B1;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;
        justify-content: center; /* align horizontal */
        align-items: center; /* align vertical */
    }

    .bubble-left-female:after {
        content: '';
        position: absolute;
        border-style: solid;
        border-width: 5px 8px 5px 0;
        border-color: transparent #FF87B1;
        display: block;
        width: 0;
        z-index: 1;
        margin-top: -5px;
        left: -7px;
        top: 50%;
    }
    .bubble-right {
        display: flex;
        position: relative;
        min-width: 50px;
        min-height: 40px;
        padding: 0px;
        margin-right: 5px; 
        background: #D0DDD7;
        -webkit-border-radius: 10px;
        -moz-border-radius: 10px;
        border-radius: 10px;
        justify-content: center; /* align horizontal */
        align-items: center; /* align vertical */
    }

    .bubble-right:after {
        content: '';
        position: absolute;
        border-style: solid;
        border-width: 5px 0 5px 8px;
        border-color: transparent #D0DDD7;
        display: block;
        width: 0;
        z-index: 1;
        margin-top: -5px;
        right: -7px;
        top: 50%;
    }
    .text {
        font-size: 3vmin;
        padding: 10px;
    }

    .text>div {
        max-width: 20vmax;
        word-wrap: break-word;
        word-break: keep-all;
    }

    .friend-msg {
        display: flex;
        align-items: center; /* align vertical */
        margin: 2.5vmin;
    }

    .self-msg {
        display: flex;
        align-items: center; /* align vertical */
        justify-content: flex-end;
        margin: 2.5vmin;        
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
        -webkit-box-shadow: inset 0 0 1px rgba(0,0,0,0.6); 
    }

    @supports (-ms-ime-align:auto) {
        .message-box {
            height:calc(35 * (1vw + 1vh - 1vmin));
        }
        
        .input-div {
            height: calc(5 * (1vw + 1vh - 1vmin));
        }

        .chat-box {
            width: calc(35 * (1vw + 1vh - 1vmin));
            min-height: calc(40 * (1vw + 1vh - 1vmin));
            height: calc(40 * (1vw + 1vh - 1vmin));
        }

        .chat-box-inner {
            min-height: calc(35 * (1vw + 1vh - 1vmin));
        }

        #emoji-panel-container {
            width: 364px;
        }

        .mdi-send, .mdi-emoticon-happy {
            font-size: calc(2.5 * (1vw + 1vh - 1vmin));
        }

        .is-active {
            font-size: calc(2.5 * (1vw + 1vh - 1vmin));
        }

        .bubble-left-male:after, .bubble-left-female:after, .bubble-left-typing:after{
            border-width: 5px 8px 5px 0;
        }

        .bubble-right-male:after, .bubble-right-female:after{
            border-width: 5px 0 5px 8px;
        }

        .text>div {
            max-width: calc(20 * (1vw + 1vh - 1vmin));
            word-wrap: break-word;
        }
    }

    @media (max-width: 1400px) {
        .chat-input {
            font-size: 1.5vmin;
        }
    }

    @-moz-document url-prefix() {
        #emoji-panel-container {
            width: 370px !important;
        }    
    }







</style>