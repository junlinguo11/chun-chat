<template>
    <v-container class="tab-container">
        <v-layout class="tab-layout">
            <v-flex xs12>
                <slot></slot>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<style scoped>
.tab-container {
    width: 18vmax;
    min-height: 40vmax;
    padding: 0;
}

.tab-layout {
    height: 40vmax;
}
</style>