<template>
<v-container grid-list-xl>
    <v-layout row wrap>
        <v-flex>
            <form>
                <v-layout row wrap>
                    <v-flex xs12 sm12>
                        <v-text-field
                            v-model="username"
                            label="用户名"
                            :error-messages="errors.collect('用户名')"
                            v-validate="'required'"
                            name='username'
                            data-vv-name="用户名"
                            required
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12>
                        <v-text-field
                        label="密码"
                        v-model="password"
                        :append-icon="visible ? 'visibility' : 'visibility_off'"
                        @click:append="() => (visible = !visible)"
                        :type="visible ? 'password' : 'text'"
                        :error-messages="errors.collect('密码')"
                        @keyup.enter="submit"
                        v-validate="'required'"
                        name='password'
                        data-vv-name="密码"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 lg12>
                        <alert-bar :has-response="hasReponse" :is-success="isSuccess" v-html="hint"></alert-bar>
                    </v-flex>
                </v-layout>
                <v-btn @click="submit" :loading="loading" :disabled="loading">登录</v-btn>
                <v-btn to="/">注册</v-btn>
            </form>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import { Validator } from 'vee-validate';
import { login } from '@/api/user';
import AlertBar from './AlertBar.vue'
export default {
    name: 'loginForm',
    components: { AlertBar },
    data () {
    return {
        username: '',
        password: '',
        visible: true,
        hasReponse: false,
        isSuccess: false,
        message: '',
        loading: false,
    }
    },
    computed: {
        hint: function() {
            return this.isSuccess ? `<i class='mdi mdi-checkbox-marked-circle mr-2'></i> 成功登录` : `<i class='mdi mdi-alert-decagram mr-2'></i>${this.message}`;
        }
    },
     methods: {
      submit () {
        this.$validator.validateAll().then(result => {
            if(result) {
                this.loading = true;
            if (window.Notification && Notification.permission !== "granted") {
                Notification.requestPermission();
            }
                login(this.username,this.password)
                    .then((res) => {
                        this.loading = false;
                        this.hasReponse = true;
                        this.isSuccess = res.isSuccess;
                        this.message = res.message;

                        if(this.isSuccess) {
                            this.$router.push('/chatroom');
                        }
                    });
            }
        });
      },
        askNoticePerimission: function() {    
            // Let's check if the browser supports notifications
            if (!("Notification" in window)) {
                console.log("This browser does not support desktop notification");
            }
            else if (Notification.permission !== "denied") {
                Notification.requestPermission();
            }

            // At last, if the user has denied notifications, and you 
            // want to be respectful there is no need to bother them any more.
            }            
    }
}
</script>