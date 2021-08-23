export default function (Vue, app) {
    window.addEventListener("unmount", function () {
        console.log("The micro app has been uninstalled");
        app.$destroy();
    });

    window.microApp &&
    window.microApp.addDataListener((data) => {
        // console.log("From Data:", data)
        if (data.$Message) {
            Vue.prototype.$Message = data.$Message
        }
          if (data.ViewUI) {
              Vue.use(data.ViewUI, {
                  transfer: false,
                  size: 'large',
                  capture: false
              });
          }
        if (data.$api) {
            Vue.prototype.$api = data.$api
        }
        if (data.$data) {
            app.sworkData = data.$data
        }
    }, true);

    Vue.prototype.$app = app
}