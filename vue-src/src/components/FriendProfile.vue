<template>
    <v-layout class="profile">
        <v-flex xs12>
                <v-container class="pl-0 pr-0 pb-0 profile-container">
                    <v-layout>
                        <v-flex text-xs-center>
                            <div class="avatarDiv">
                                <v-avatar size="20vmin">
                                    <img :src="friend.avatar" alt="avatar">
                                </v-avatar>
                            </div>
                            <div class="username">
                                {{friend.username}}
                                <v-icon v-if="friend.gender === '男'" class="blue--text">mdi-gender-male</v-icon>
                                <v-icon v-else class="pink--text">mdi-gender-female</v-icon>
                            </div>                             
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <v-flex xs10 offset-xs1>
                            <div class="user-info mt-3">
                                <div><v-icon class="grey--text text--lighten-1">mdi-email</v-icon><span>{{friend.email}}</span></div>
                                <div><v-icon class="grey--text text--lighten-1">mdi-cellphone-iphone</v-icon><span>{{friend.mobile}}</span></div>
                                <div><v-icon class="grey--text text--lighten-1">mdi-lead-pencil</v-icon>
                                    <div :class="{'animated tada': isHover}" id="status"
                                    @mouseover="isHover=true" @mouseleave="isHover=false">{{friend.status ? friend.status : '他有点懒，什么也没写...'}}</div>
                                </div>
                            </div>                          
                        </v-flex>
                    </v-layout>
                </v-container>
        </v-flex>
    </v-layout>
</template>
<script>
import { mapGetters } from 'vuex';
    export default {
        name: 'friendprofile',
        data() {
            return {
                isHover: false,
            }
        },
        computed: {
            ...mapGetters('chatRoom', { friend: 'currentFriend' })
        }
    }
</script>

<style scoped>
    .profile {
        max-width: 18vmax;
        min-height: 40vmax;
    }
    
    .profile-container {
        min-height: 40vmax;
        background-color: #fcffff;
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

    .username {
        display: flex;
        justify-content: center;
        margin-bottom: 0;
        font-size: 5vmin;
        font-family: 'Fugaz One';
    }

    #status {
        display: inline-block;
    }

    .user-info {
        font-size: 2vmin;
        color: gray;
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
            height: calc(40 * (1vw + 1vh - 1vmin));
            min-height: calc(40 * (1vw + 1vh - 1vmin));
        }

        .profile-container {
            min-height: calc(40 * (1vw + 1vh - 1vmin));
        }
    }
</style>
