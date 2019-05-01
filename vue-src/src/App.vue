<template>
  <div id="app">
    <nav-bar></nav-bar>
    <main>
      <keep-alive>
        <router-view class="view grey lighten-3" v-if="$route.meta.keepAlive"></router-view>
      </keep-alive>
      <router-view class="view grey lighten-3" v-if="!$route.meta.keepAlive"></router-view>
    </main>  
  </div>
</template>

<script>
import { getCookie } from '@/utils/cookie';
import NavBar from './components/NavBar.vue';
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'app',
  components: { NavBar },
  methods:{
    isLoggedIn() {
      const jwt = getCookie('awesome');
      if(jwt) {
        let payload = jwt.split('.')[1];
        payload = window.atob(payload);
        payload = decodeURIComponent(payload);
        payload = JSON.parse(payload);
        return payload.exp > Date.now() / 1000;
      } else {
        return false;
      }
    },
    checkLogin(){
      if(this.isLoggedIn()){
        this.getUser().then((user) => {
            this.$socket.emit('online', user._id);
            document.title = `纯聊|${user.username}`;
            this.getChatRooms();
        }).then(() => {
          if(this.$router.path !== '/chatroom') {
              this.$router.push('/chatroom');
          } 
        });
      } else {
        //ocalStorage.removeItem('token');
        //EventBus.$emit('logout');
      }
    },
    ...mapActions('user', ['getUser']),
    ...mapActions('chatRoom', ['getChatRooms'])
  },
  watch:{
    "$route" : 'checkLogin'
  },
  mounted() {
    this.checkLogin();
  }
}
</script>

<style scoped>
@import 'https://fonts.googleapis.com/css?family=Fugaz+One|Roboto:300';
@import 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';

#app {
  height: 100%;
  font-family: 'Roboto', "Microsoft Yahei", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-image: url('https://i.imgur.com/A9Z0ImX.jpg');
  background-position: center;
  background-attachment: fixed;
  background-size: 100% 100%; 
}
</style>
