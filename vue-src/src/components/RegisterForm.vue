<template>
<v-container grid-list-xl>
    <v-layout row wrap>
        <v-flex>
            <form>
                <v-layout row wrap>
                    <v-flex xs12 sm12 lg6>
                        <v-text-field
                            v-model="username"
                            label="用户名"
                            :error-messages="errors.collect('用户名')"
                            v-validate="'required|min:3|uniqueName'"
                            data-vv-name="用户名"
                            :append-icon="username&&nameValid?'mdi-checkbox-marked-circle':''"
                            required
                            @keyup="onTypeName"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 lg6>
                        <v-select
                        v-bind:items="genders"
                        v-model="gender"
                        label="性别"
                        :error-messages="errors.collect('性别')"
                        v-validate="'required'"
                        data-vv-name="性别"
                        item-value="text"
                        required
                        ></v-select>
                    </v-flex>
                    <v-flex xs12 sm12 lg6>
                        <v-text-field
                        v-model="email"
                        label="E-mail"
                        :error-messages="errors.collect('email')"
                        v-validate="'required|email|uniqueEmail'"
                        data-vv-name="email"
                        :append-icon="email&&emailValid?'mdi-checkbox-marked-circle':''"
                        required
                        @keyup="onTypeEmail"
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 lg6>
                        <v-text-field
                        v-model="mobile"
                        label="手机"
                        :error-messages="errors.collect('手机')"
                        v-validate="'mobile'"
                        data-vv-name="手机"
                        data-vv-delay = 1200
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 lg6>
                        <v-text-field
                        label="密码"
                        v-model="password"
                        :append-icon="visible ? 'visibility' : 'visibility_off'"
                        @click:append="() => (visible = !visible)"
                        :type="visible ? 'password' : 'text'"
                        :error-messages="errors.collect('密码')"
                        v-validate="'required|password|min:8'"
                        name='password'
                        ref='password'
                        data-vv-name="密码"
                        required
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 sm12 lg6>
                        <v-text-field
                        label="确认密码"
                        v-model="confirmPassword"
                        :append-icon="visible2 ? 'visibility' : 'visibility_off'"
                        @click:append="() => (visible2 = !visible2)"
                        :type="visible2 ? 'password' : 'text'"
                        :error-messages="errors.collect('确认密码')"
                        name="confirm-password"
                        data-vv-name="确认密码"
                        v-validate="'confirmed:password|required|password|min:8'"
                        required
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 lg12 v-show="hasResponse">
                        <alert-bar :has-response="hasResponse" :is-success="isSuccess">
                            <div v-if="isSuccess">
                                您已注册成功，<router-link to='/login'>点此登录</router-link>
                            </div>
                            <div v-else-if="message">
                                {{message}}
                            </div>
                            <div v-else>
                                遇到了一些问题，请尝试重新注册
                            </div>
                        </alert-bar>
                    </v-flex>
                    <v-flex>
                        <vue-recaptcha ref="recaptcha" sitekey="6Lfp0zEUAAAAAH_Of9Aqy6QgALXBVi3oibUgDwbv" @verify="onVerify"></vue-recaptcha>
                    </v-flex>
                </v-layout>
                <v-btn @click="submit" :loading="loading" :disabled="loading">提交</v-btn>
                <v-btn @click="clear">清空</v-btn>
            </form>
        </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import { Validator } from 'vee-validate';
import { signin } from '@/api/user';
import { checkUniqueUserName, checkUniqueEmail } from '@/api/validation';
import AlertBar from './AlertBar.vue'
import VueRecaptcha from 'vue-recaptcha';
export default {
    name: 'registerForm',
    components: { AlertBar, VueRecaptcha },
    data () {
        return {
            username: '',
            email: '',
            nameValid: false,
            emailValid: false,
            genders: [
                { text: '男' },
                { text: '女' },
            ],
            gender: '',
            mobile: '',
            visible: true,
            visible2: true,
            password: '',
            confirmPassword: '',
            
            recaptchaVisible: true,
            recaptchaResponse: '',
            message: '',
            hasResponse: false,
            isSuccess: false,
            loading: false,
            errorBag: {}
        }
    },
    methods: {
        onVerify: function (response) {
            this.recaptchaResponse = response;
        },
        onTypeName: function() {
            if(this.errorBag.has('用户名')) {
                this.nameValid = false;
            }
        },        
        onTypeEmail: function() {
            if(this.errorBag.has('email')) {
                this.emailValid = false;
            }
        },
        submit: function() {
            this.$validator.validateAll().then(result => {
                if(result) {
                    this.loading = true;
                    signin({ 
                        username: this.username,
                        gender: this.gender,
                        email: this.email,
                        mobile: this.mobile,
                        password: this.password,
                        confirmPassword: this.confirmPassword,
                        recaptchaResponse: this.recaptchaResponse 
                    })
                        .then((res) => {
                            this.hasResponse = true;
                            this.loading = false;
                            this.isSuccess = res.isSuccess;
                            if(this.isSuccess) this.clear();
                            this.$refs.recaptcha.reset()
                            if(res.message) this.message = res.message;
                        });
                }
            });
        },
        clear: function() {
            this.username = ''
            this.email = ''
            this.gender = null
            this.mobile = ''
            this.password = ''
            this.confirmPassword = ''
            this.$validator.reset()
        }
    },
    created() {
        this.errorBag = this.$validator.errors;
        const nameisUnique = (value) => {
            if(value.length >= 3) {
                return checkUniqueUserName(value)
                    .then((res) => {
                        this.nameValid = res.valid;

                        return {
                            valid: res.valid,
                            data: {
                                message: res.message
                            }
                        };
                    });

            } else {
                this.nameValid = false;
            }
        };
        const emailisUnique = (value) => {
            return checkUniqueEmail(value)
                .then((res) => {
                    this.emailValid = res.valid;

                    return {
                        valid: res.valid,
                        data: {
                            message: res.message
                        }
                    };
                });
        };        
        Validator.extend('mobile', {
            getMessage: field => `手机格式不正确`,
            validate: value => {
                const regx = /^1[34578]\d{9}$/;
                return regx.test(value);
            }
        })
        Validator.extend('password', {
            getMessage: field => `密码需包含数字，大写字母，小写字母，至少8位`,
            validate: value => {
                const regx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
                return regx.test(value);
            }
        })
        Validator.extend('uniqueName', {
            validate: nameisUnique,
            getMessage: (field, params, data) => {
                return data.message;
            }
        });
        Validator.extend('uniqueEmail', {
            validate: emailisUnique,
            getMessage: (field, params, data) => {
                return data.message;
            }
        });      
    }

}
</script>