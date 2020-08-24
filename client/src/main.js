import Vue from "vue";
import App from "./App.vue";
import "./Api" // Import API on top-level so it doesn't keep getting re-imported
//import * as routing from "./router"
import routes from "./routes";

import Buefy from "buefy";
import "buefy/dist/buefy.css";
Vue.use(Buefy, {
  defaultIconPack: 'fad'
});

import axios from "axios";
import VueAxios from "vue-axios";
Vue.use(VueAxios, axios);

import VueRouter from "vue-router";
Vue.use(VueRouter);
// let router = routing.routerSetup();

const router = new VueRouter({
  routes,
  mode: 'history'
});


new Vue({
  router,
  render: h => h(App)
}).$mount("#app");