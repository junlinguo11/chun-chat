import Vue from 'vue'
import Vuex from 'vuex'
import store from './vuex'
import Vuetify from 'vuetify'
import VeeValidate, { Validator } from 'vee-validate';
// import cn from 'vee-validate/dist/locale/zh_CN';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import App from './App'
import router from './router'
import VueSocketio from 'vue-socket.io';
import VueTabs from 'vue-nav-tabs';
import VueChatScroll from 'vue-chat-scroll';
import 'vue-nav-tabs/themes/vue-tabs.css';
import 'emoji-panel/lib/emoji-panel-apple-32.css';

Vue.config.productionTip = false;

Vue.use(Vuex);
Vue.use(Vuetify, {
  iconfont: 'mdi',
});
Vue.use(VueTabs);
Vue.use(VueChatScroll);
Vue.use(new VueSocketio({
  connection: 'http://localhost:3000/',
}));
// const dictionary = {
//   zh_CN: {
//     custom: {
//       用户名: { 
//         required: "用户名必须填哦！"
//       },
//       email: { 
//         required: "你难道没有email吗？"
//       },
//       密码: {
//         confirmed: "两次输入不匹配"
//       },
//       确认密码: {
//         confirmed: "两次输入不匹配"
//       }
//     }
//   }
// };

// Validator.localize('zh', dictionary);


// Validator.addLocale(cn);
Vue.use(VeeValidate, {
  locale: 'zh_CN'
});

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
