<template>
    <div id="app" v-if="MICRO_APP_ENVIRONMENT">
        <!--<div class="text-center tw-mt-2 tw-mb-2 f24 fwb">Welcome to swork plugin-system</div>-->
        <!--<div class="text-center tw-mt-2 tw-mb-2 f16">Start your custom journey</div>-->
        <!--<div>-->
        <!--    <router-link :to="{ name: 'swork-page1' }">swork-page1</router-link>-->
        <!--    |-->
        <!--    <router-link :to="{ name: 'swork-page2' }">swork-page2</router-link>-->
        <!--</div>-->
        <router-view/>
    </div>
    <div v-else>
        The swork-app runs successfully. Please check the running status in swork.😀
    </div>
</template>

<script>

export default {
    name: "App",
    data() {
        return {
            MICRO_APP_ENVIRONMENT: false
        }
    },
    mounted() {
        this.MICRO_APP_ENVIRONMENT = window.__MICRO_APP_ENVIRONMENT__
        if (!this.MICRO_APP_ENVIRONMENT) {
            console.log('Not in MICRO_APP_ENVIRONMENT')
        } else {
            this.MICRO_APP_ENVIRONMENT = true
        }
    }
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
}
</style>
