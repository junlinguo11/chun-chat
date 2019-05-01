import Vue from 'vue'
import Router from 'vue-router'
import RegisterBase from '@/components/RegisterBase'
import LoginBase from '@/components/LoginBase'
import ChatRoom from '@/components/ChatRoom'
import { getCookie } from '@/utils/cookie';

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: RegisterBase,
      meta: {keepAlive: true}
    },
    {
      path: '/login',
      component: LoginBase,
      meta: {keepAlive: false}
    },
    {
      path: '/chatroom',
      component: ChatRoom,
      meta: {keepAlive: false},
      beforeEnter: (_, __, next) => {
        if(getCookie('awesome')) {
          next();
        } else {
          next('/login');
        }
      }
    },
    { path: '*', redirect: '/' }
  ]
})
