## 简介

使用基于`single-spa`的微前端实现库`qiankun`搭建的微前端架构,子应用接入`React`/`Vue`/`Angular`主流前端框架。

## 什么是微前端

> 微前端是一种多个团队通过独立发布功能的方式来共同构建现代化 web 应用的技术手段及方法策略。

微前端架构具备以下几个核心价值：

- 主框架不限制接入应用的技术栈，微应用具备完全自主权
- 微应用仓库独立，前后端可独立开发，部署完成后主框架自动完成同步更新
- 在面对各种复杂场景时，我们通常很难对一个已经存在的系统做全量的技术栈升级或重构，而微前端是一种非常好的实施渐进式重构的手段和策略
- 每个微应用之间状态隔离，运行时状态不共享

## 项目介绍

### 目录结构

```js
micro-fed-qiankun
├── angular-app  // Angular 微应用
├── micro-main   // 主应用
├── react-app    // React 微应用
├── vue-app      // Vue 微应用
```

### 技术栈

- `qiankun: 2.5.1`
- `react: 17.0.2`
- `vue: 2.6.11`
- `angular: 13.0.0`

## 配置参考

### 🚀 主应用

#### 安装 `qiankun`

```
yarn add qiankun or npm i qiankun -S
```

#### 注册微应用

修改[micro-main/src/index.js](https://github.com/basilbai/micro-fed/blob/master/micro-main/src/index.js)注册微应用并启动

```js
import React from "react";
import ReactDOM from "react-dom";
import {
  registerMicroApps,
  start,
  setDefaultMountApp,
  runAfterFirstMounted,
} from "qiankun";
import App from "./App";

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
```

#### 添加子应用容器

添加[micro-main/src/App.js](https://github.com/basilbai/micro-fed/blob/master/micro-main/src/App.js)子应用容器元素

```html
 <div id="subapp-viewport"></div>
```

### 🚀React 微应用

#### 在 `src` 目录新增 `public-path.js`：

```
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

#### 修改入口文件 [react-app/src/index.js](https://github.com/basilbai/micro-fed/blob/master/react-app/src/index.js)

```js
import "./public-path";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

function render(props) {
  const { container } = props;
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    // 为了避免根 id #root 与其他的 DOM 冲突，需要限制查找范围。
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
}

if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log("[react17] react app bootstraped");
}

export async function mount(props) {
  console.log("[react17] props from main framework", props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(
    container
      ? container.querySelector("#root")
      : document.querySelector("#root")
  );
}

```
#### 修改 `webpack` 配置
1. 安装`@rescripts/cli`插件 
```
npm i -D @rescripts/cli
```
2. 根目录新增 `.rescriptsrc.js`：
```js
const { name } = require("./package");

module.exports = {
  webpack: (config) => {
    config.output.library = `${name}-[name]`;
    config.output.libraryTarget = "umd";
    config.output.jsonpFunction = `webpackJsonp_${name}`;
    config.output.globalObject = "window";

    return config;
  },

  devServer: (_) => {
    const config = _;
    config.headers = {
      "Access-Control-Allow-Origin": "*",
    };
    config.historyApiFallback = true;
    config.hot = false;
    config.watchContentBase = false;
    config.liveReload = false;

    return config;
  },
};

```
3. 修改 `package.json`：
```
  "start": "rescripts start",
  "build": "rescripts build",
  "test": "rescripts test",
```
