<template>
    <v-alert
        v-model="hasResponse"
        :color="isSuccess ? 'success' : 'warning'"
        :icon="isSuccess ? 'check_circle' : 'warning'"
        class="alert"
        :value="hasResponse"
        transition="scale-transition"
        dismissible
    >
        <slot></slot>
    </v-alert>
</template>

<script>
    export default {
        props: {
            isSuccess: {
                type: Boolean,
                required: true
            },
            hasResponse: {
                type: Boolean,
                required: true
            }
        },
        data() {
            return {
                visible: true
            }
        }
    }
</script>

<style scoped>
.alert {
    border-radius: 10px;
}
</style>