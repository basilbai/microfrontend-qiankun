import React from "react";
import ReactDOM from "react-dom";
import {
  registerMicroApps,
  start,
  setDefaultMountApp,
  runAfterFirstMounted,
} from "qiankun";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

function render({ loading }) {
  const container = document.getElementById("root");
  ReactDOM.render(
    <React.StrictMode>
      <App loading={loading} />
    </React.StrictMode>,
    container
  );
}

render({ loading: true });

const loader = (loading) => render({ loading });

const apps = [
  {
    name: "reactApp",
    entry: "//localhost:8585",
    activeRule: "/react",
    container: "#subapp-viewport",
    loader,
  },
  {
    name: "vueApp",
    entry: "//localhost:8686",
    container: "#subapp-viewport",
    loader,
    activeRule: "/vue",
  },
  {
    name: "angularApp",
    entry: "//localhost:8787",
    container: "#subapp-viewport",
    loader,
    activeRule: "/angular",
  },
];
registerMicroApps(apps, {
  beforeLoad: (app) => {
    console.log("before load app.name=====>>>>>", app.name);
  },
  beforeMount: [
    (app) => {
      console.log("[LifeCycle] before mount %c%s", "color: green;", app.name);
    },
  ],
  afterMount: [
    (app) => {
      console.log("[LifeCycle] after mount %c%s", "color: green;", app.name);
    },
  ],
  afterUnmount: [
    (app) => {
      console.log("[LifeCycle] after unmount %c%s", "color: green;", app.name);
    },
  ],
});

setDefaultMountApp("/vue");

start();

runAfterFirstMounted(() => {
  console.log("[MainApp] first app mounted");
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
