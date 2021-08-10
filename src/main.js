import "./public-path";
import Vue from "vue";
import VueRouter from "vue-router";
import routes from "./router";
import App from "./App.vue";
import init from './init'

Vue.config.productionTip = false;

function getBaseName() {
    return "/";
}

const router = new VueRouter({
    options: {
        base: getBaseName(),
    },
    routes,
});

let app = new Vue({
    router,
    data: {
        sworkData: {}
    },
    render: (h) => h(App),
}).$mount("#app");

init(Vue, app)

console.timeEnd("micro-app");
