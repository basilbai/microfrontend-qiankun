import "./public-path";
import Vue from "vue";
import App from "./App.vue";

let instance = null;

Vue.config.productionTip = false;

function render(props = {}) {
  const { container } = props;

  instance = new Vue({
    render: (h) => h(App),
  }).$mount(container ? container.querySelector("#app") : "#app");
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap() {
  console.log("[vue] vue app bootstraped");
}
export async function mount(props) {
  console.log("[vue] props from main framework", props);
  render(props);
}
export async function unmount() {
  instance.$destroy();
  instance.$el.innerHTML = "";
  instance = null;
}
