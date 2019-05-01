<template>
  <v-app>
    <v-layout>
      <v-flex xs12 sm6 offset-sm3 lg6 offset-lg3>
        <v-card class="mt-4">
          <v-img
            class="white--text"
            height="200px"
            src="https://i.imgur.com/kDpdmiL.jpg"
          ></v-img>
          <register-form></register-form>
        </v-card>
      </v-flex>
    </v-layout>
  </v-app>
</template>

<script>
import RegisterForm from './RegisterForm.vue';
export default {
  name: 'loginBase',
  components: { RegisterForm },
}
</script>