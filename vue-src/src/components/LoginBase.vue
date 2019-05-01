<template>
  <v-app>
    <v-layout>
      <v-flex class="loginDiv" xs12 sm4 offset-sm4 lg4 offset-lg4>
        <v-card class="mt-4" transition="slide-x-reverse-transition" origin="center center">
          <v-img
            class="white--text"
            height="240px"
            src="https://i.imgur.com/0n2iJv8.jpg"
          >
          </v-img>
          <login-form></login-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-app>
</template>

<script>
    import LoginForm from './LoginForm.vue';
    export default {
        name: "loginBase",
        components: { LoginForm },
        data() {
            return {
            }
        },
        created() {
          document.title = '纯聊|用户登录';
        }
    }
</script>

<style scoped>
.loginDiv {
  margin-top: 5vmax;
}

@media (max-width: 1600px) {
  .loginDiv {
    margin-top: 3vmax;
  }
}

@media (max-width: 600px) {
  .loginDiv {
    margin-top: inherit;
  }
}
</style>
