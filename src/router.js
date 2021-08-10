import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        redirect: "/i18n-page/",
    },
    {
        path: "/i18n-page",
        name: "i18n-page",
        component: () =>
            import( "./views/index"),
    },
];

export default routes;
