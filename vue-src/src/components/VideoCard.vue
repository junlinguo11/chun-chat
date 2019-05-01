<template>
    <v-card class="video-card">
        <div
            class="background"
            :style="{ backgroundImage: `url(${target.avatar})` }" />
        <div class="target">
            <v-avatar size="15vmin">
                <img :src="target.avatar" alt="avatar" @click="onAgree">
            </v-avatar>
            <div class="username grey--text text--lighten-4">
                {{target.username}}
                <v-icon v-if="target.gender === '男'" class="blue--text">mdi-gender-male</v-icon>
                <v-icon v-else class="pink--text">mdi-gender-female</v-icon>
            </div>
        </div>
        <div class="buttons">
            <div class="btn call-btn">
                <v-icon>call</v-icon>
            </div>
            <div
                class="btn end-btn"
                @click="hangup">
                <v-icon>call_end</v-icon>
            </div>
        </div>
        <video ref="video" />
    </v-card>
</template>
<script>
import { iceServer } from '@/config';
import eventBus from '@/eventBus';

export default {
    name: 'VideoCard',
    props: {
        request: {
            type: Object,
            default: () => ({}),
        },
        srcObject: {
            type: MediaStream,
            default: null,
        },
    },
    data() {
        return {
            videoConnection: null,
        };
    },
    computed: {
        sender() {
            return this.request.sender || {};
        },
        receiver() {
            return this.request.receiver || {};
        },
        target() {
            return this.sender ? this.sender : this.receiver;
        },
    },
    watch: {
        srcObject(newVal) {
            this.$refs.video.srcObject = newVal;
            this.$refs.video.onloadedmetadata = () => {
                this.$refs.video.play();
            };
        },

    },
    mounted() {
        document.body.appendChild(this.$el);
    },
    methods: {
        hangup() {
            if (this.srcObject) {
                this.srcObject.getTracks().forEach(track => track.stop());
            }

            eventBus.$emit('hangup');
        },
    },
}
</script>
<style scoped>
.video-card {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 25vmax;
    height: 70%;
    overflow: hidden;
}

.background {
    position: absolute;
    top: -25px;
    bottom: -25px;
    left: -25px;
    right: -25px;
    background-size: cover;
    background-position: center center;
    filter: blur(15px) grayscale(50%);
    z-index: -1;
}

.target {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.username {
    font-size: 3vmin;
}

.buttons,
.btn {
    display: flex;
    justify-content: center;
    align-items: center;
}

.buttons {
    position: absolute;
    width: 100%;
    bottom: 30px;
    z-index: 1;
}

.btn {
    width: 60px;
    height: 60px;
    margin: 0 50px;
    border-radius: 999px;
    cursor: pointer;
}

.call-btn {
    background-color: green;
}

.end-btn {
    background-color: red;
}
</style>