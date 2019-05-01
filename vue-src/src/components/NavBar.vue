<template>
    <v-toolbar class="navbar" flat dense>
    <v-toolbar-side-icon class="hidden-md-and-up"></v-toolbar-side-icon>
    <v-toolbar-title>
        <img class="logo" :class="{'animated pulse': isHover}" @mouseover="isHover=true" @mouseleave="isHover=false" src="../assets/logo.png">
    </v-toolbar-title>
    <span>BY Junlin Guo</span>
    <v-spacer></v-spacer>
    <v-toolbar-items class="hidden-sm-and-down">
      <template v-if="user.username">
        <v-btn color="primary" flat to='/chatroom'><v-avatar size="30px" class="grey lighten-4 mr-1"><img :src="user.avatar" alt="avatar"></v-avatar>{{user.username}}</v-btn>
        <v-btn flat @click="showAbout=true">About</v-btn>
        <v-btn flat @click="showContact=true">Contact</v-btn>
      </template>
      <template v-else>
        <v-btn color="primary" flat to='/' exact>注册</v-btn>
        <v-btn color="primary" flat to='/login'>登录</v-btn>
      </template>
    </v-toolbar-items>
    <vue-dialog v-if="showAbout" dialogName="about">
        <template slot="title">关于纯聊</template>
        <template slot="content">
            “纯聊”是我一次自我的实践。主要目的是在学习了技术以后给自己一个机会能施展技术，不然就是纸上谈兵了。<br/><hr/>
            即时聊天的实现并不难，寥寥几行代码一切都为你准备完毕。所以这个项目对我来说，难点主要出在: <br/>1.操作数据库 <br/>2.前端获取和展示聊天记录的逻辑。<br/>
            所以在开发过程中遇到这两个方面的问题我固执地自己想自己的笨办法，目的也只是希望能练习大脑。<br/><hr/>如果你在使用“纯聊”，谢谢你能容忍一个不会设计的前端搞出来的界面~遇到bug拜托拜托请告诉我！！！！！！！旁边的链接里有我的联系方式！！！！！
        </template>
    </vue-dialog>
    <vue-dialog v-if="showContact" dialogName="contact">
        <template slot="title">联系我</template>
        <template slot="content">
            <v-icon class="grey--text text--lighten-1 mr-2">mdi-email</v-icon><span>junlin.guo11@gmail.com</span><br>
            <v-text-field
            name="input"
            label="拜托告诉我bug~~，谢谢~"
            v-model="report"
            v-validate="'required'"
            textarea
            required
            ></v-text-field>
            <v-btn color="primary" @click="sendReport" :loading="loading" :disabled="loading">发送</v-btn>
        </template>
    </vue-dialog>
    </v-toolbar>
</template>

<script>
    import { sendReport } from '@/api/report';
    import EventBus from '../eventBus';
    import VueDialog from './VueDialog.vue';
    import { mapState } from 'vuex'
    export default {
        name: "navbar",
        components: { VueDialog },
        data() {
            return {
                title: "Chat App",
                showAbout: false,
                showContact: false,
                isHover: false,
                report: '',
                loading: false,
            }
        },
        computed: {
            ...mapState('user', ['user'])
        },
        methods: {
            sendReport: function() {
                this.$validator.validateAll().then(result => {
                    if(result) {
                        this.loading = true;

                        sendReport(this.report)
                            .then(() => {
                                this.loading = false;
                                this.report = "";
                            });
                    }
                })
            }
        },
        created() {
            EventBus.$on('closeDialog', (dialogName) => {
                if(dialogName === 'about') {
                    this.showAbout = false;
                } else {
                    this.showContact = false;
                }
            });          
        }
    }
</script>
<style scoped>
    .navbar {
        background-color: rgba(255, 255, 255, 0.9);
    }
    .logo {
        width: 3.5vmax;
        margin-left: 1vmax;
        margin-top: 10px;
        margin-right: 1vmin;
    }

    @supports (-ms-ime-align:auto) {
        .logo {
            width: calc(3.5 * (1vw + 1vh - 1vmin));;
            margin-left: calc(1 * (1vw + 1vh - 1vmin));
            margin-top: 10px;
        }
    }
</style>
