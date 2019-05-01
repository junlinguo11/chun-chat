<template>
    <v-layout class="profile">
        <v-flex xs12>
                <v-container class="pl-0 pr-0 pb-0 profile-container">
                    <v-layout>
                        <v-flex text-xs-center>
                            <div class="avatarDiv">
                                <v-avatar size="20vmin">
                                    <img :src="user.avatar" alt="avatar">
                                </v-avatar>
                                <v-btn color="primary" fab ripple small dark top right absolute class="uploadBtn indigo--text" :loading="loading" :disabled="loading">
                                    <v-icon class='edit-icon'>edit</v-icon>
                                    <input style="" type="file" id="fileInput" name="fileInput" accept="image/*" v-on:change="fileSelected"/>
                                </v-btn>
                            </div>
                            <div class="username grey--text text--lighten-4">
                                {{user.username}}
                                <v-icon v-if="user.gender === '男'" class="blue--text">mdi-gender-male</v-icon>
                                <v-icon v-else class="pink--text">mdi-gender-female</v-icon>
                            </div>                             
                        </v-flex>
                    </v-layout>
                    <v-layout class="grey--text text--lighten-1">
                        <v-flex xs10 offset-xs1>
                            <div class="user-info mt-3">
                                <div><v-icon class="grey--text text--lighten-1">mdi-email</v-icon><span>{{user.email}}</span></div>
                                <div><v-icon class="grey--text text--lighten-1">mdi-cellphone-iphone</v-icon><span>{{user.mobile}}</span></div>
                                <div><v-icon class="grey--text text--lighten-1">mdi-lead-pencil</v-icon>
                                    <div :class="{'animated tada': isHover}" id="status" v-if="!isEditing" @click="editStatus" @mouseover="isHover=true" @mouseleave="isHover=false">{{user.status ? user.status : '"编辑一句话说说自己的想法"'}}</div>
                                    <textarea class="status-textarea" v-if="isEditing" v-model="user.status" @blur="onBlur" maxlength="35" ref="textarea"></textarea>
                                </div>
                            </div>                             
                        </v-flex>
                    </v-layout>
                </v-container>
                <v-snackbar top v-model="hasError" :timeout="timeout">
                    {{errorMsg}}
                    <v-btn flat class="pink--text" @click.native="hasError = false">Close</v-btn>
                </v-snackbar>
        </v-flex>
    </v-layout>
</template>
<script>
import { uploadImage } from '@/api/user';
import { mapState, mapActions } from 'vuex'
    export default {
        name: 'profile',
        data() {
            return {
                loading: false,
                hasError: false,
                errorMsg: '',
                timeout: 6000,
                isHover: false,
                isEditing: false
            }
        },
        computed: {
            ...mapState('user', ['user'])
        },
        methods: {
            fileSelected: function(e) {
                this.loading = true;
                const img = e.target.files[0];
                const headers = {
                    'authorization': 'Client-ID 0255e84e0729357'
                }
                if (img) {
                    uploadImage(img, { headers })
                        .then((data) => {
                            this.updateAvatar({avatar: data.data.link})
                        })
                        .then(() => this.loading = false)
                        .catch(() => {
                            this.hasError = true;
                            this.loading = false;
                            this.errorMsg = "有点小问题，请再试一次";
                        });
                }
            },
            
            editStatus: function() {
                this.isEditing = true;
                this.$nextTick(function() {
                    this.$refs.textarea.focus();
                }); 
            },

            onBlur: function() {
                const body = {
                    status: this.user.status.trim()
                }
                this.updateStatus(body).then(() => {this.isEditing = false});
            },

            ...mapActions('user', [
                'updateStatus',
                'updateAvatar'
            ])
        }
    }
</script>

<style scoped>
    .profile {
        width: 18vmax;
        min-height: 40vmax;
        background-color: #363e47;
    }

    .profile-container {
        min-height: 40vmax;
        background-color: #363e47;
        border-radius: 0;
    }

    .avatarDiv {
        position:relative;
        display:inline-block;
    }

    .avatar {
        width: 20vmin !important;
        height: 20vmin !important;
        vertical-align: middle;
    }
    .uploadBtn {
        cursor: pointer;
        margin-top: 3vmin;
        overflow: hidden;
    }

    .edit-icon {
        position: relative !important;
        color: #fff !important;
    }

    #fileInput {
        position: absolute;
        top: 0;
        right: 0;
        min-width: 100%;
        min-height: 100%;
        text-align: right;
        filter: alpha(opacity=0);
        opacity: 0;
        outline: none;
        cursor: inherit;
        display: block;
        transform: none;
    }

    .username {
        display: flex;
        justify-content: center;
        margin-bottom: 0;
        font-size: 5vmin;
        font-family: 'Fugaz One';
    }

    .user-info {
        font-size: 2vmin;
        color: #a5b5c1;
    }
    
    .user-info>div {
        display: flex;
        justify-content: flex-start;
        padding: 3px;
    }

    .user-info>div>i {
        margin-right: 16px;
        font-size: 2vmin;
    }
    
    .card--hover {
        cursor: default;
    }

    #status {
        display: inline-block;
        color: #a5b5c1;
        word-wrap: break-word;
        word-break: break-all;
    }

    .status-textarea {
        padding: 3px;
        width: 30vmin;
        overflow: hidden;
        resize: none;
    }

    .status-textarea:focus {
        box-shadow: 0 0 5px rgba(63, 191, 127, 0.44);
        border: 1px solid rgba(63, 191, 127, 0.44);
    }
    
    @media (max-width: 700px) {
        .avatar {
            width: 20vmax !important;
            height: 20vmax !important;
        }
        .profile {
            width: 100vw;
            height: 40vmax;
        }
    }

    @supports (-ms-ime-align:auto) {
        .profile {
            width: calc(18 * (1vw + 1vh - 1vmin));
            min-height: calc(40 * (1vw + 1vh - 1vmin));
        }

        .profile-container {
            min-height: calc(40 * (1vw + 1vh - 1vmin));
        }
        .card {
            background-color: #303841 !important;
        }
    }
</style>
