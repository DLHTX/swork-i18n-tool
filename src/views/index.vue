<template>
    <div :style="$app.sworkData.curProject.project?'height: 80vh;width: 80vw;':''">
        <div class="text-center  tw-p-4" v-if="!$app.sworkData.curProject.project">
            There is no data. The plug-in needs to be used under the project. Please open the project
        </div>
        <div v-else class="tw-p-4 tw-w-full tw-h-full " >
            <i18nTool></i18nTool>
        </div>
    </div>
</template>

<script>
import i18nTool from "@/components/i18n-tool.vue"

export default {
    name: "micro-page1",
    components: {
        i18nTool
    },
    data() {
        return {
            centerDialogVisible: false,
            microDataStr: "",
            count: 1,
        };
    },
    watch: {},
    mounted() {
        console.log(window.microApp.getData());
    },
    created() {
        window.microApp &&
        window.microApp.addDataListener(this.handleDataChange, true);
    },
    beforeDestroy() {
        window.microApp &&
        window.microApp.removeDataListener(this.handleDataChange);
    },
    methods: {
        // 接收来自基座的数据
        handleDataChange(data) {
            this.$forceUpdate()
        },
        // 向基座应用发送数据
        // handleSendData() {
        //     this.count += 1;
        //     window.microApp?.dispatch({count: this.count});
        // },
    },
};
</script>

<style>
</style>