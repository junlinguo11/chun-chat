<template>
    <v-dialog v-model="show" persistent>
    <v-card>
        <v-card-title class="headline">
            <slot name="title"></slot>
        </v-card-title>
        <v-card-text>
            <slot name="content"></slot>
        </v-card-text>
        <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn class="green--text darken-1" flat="flat" @click.native="close">关闭</v-btn>
        </v-card-actions>
    </v-card>
    </v-dialog>  
</template>
<script>
import EventBus from '../eventBus';
export default {
  name: "dialog",
  props: ['dialogName'],
  data() {
      return {
          show: true
      }
  },
  methods: {
      close: function() {
          EventBus.$emit('closeDialog', this.dialogName);
      }
  }
}
</script>
