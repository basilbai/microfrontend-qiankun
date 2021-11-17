## 简介

基于`single-spa`的实现库`qiankun`搭建的微前端架构实例,主应用为`React`,子应用接入`React`/`Vue`/`Angular`主流前端框架。

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

```js
  "start": "rescripts start",
  "build": "rescripts build",
  "test": "rescripts test",
```

### 🚀Vue 微应用

#### 在 `src` 目录新增 `public-path.js`：

```js
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

#### 修改入口文件 [vue-app/src/main.js](https://github.com/basilbai/micro-fed/blob/master/vue-app/src/main.js)

```js
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
```

### 修改打包配置 `vue.config.js`

```js
const { name } = require('./package');
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};
```

### 🚀Angular 微应用

1. 在 `src` 目录新增 `public-path.js`：

```js
if (window.__POWERED_BY_QIANKUN__) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

2. 设置 `history` 模式路由的 `base`，`src/app/app-routing.module.ts` 文件：

```js
import { APP_BASE_HREF } from '@angular/common';
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // @ts-ignore
 providers: [{ provide: APP_BASE_HREF, useValue: window.__POWERED_BY_QIANKUN__ ? '/app-angular' : '/' }]
})
```

3. 修改入口文件，`src/main.ts` 文件。

```js
import './public-path';
import { enableProdMode, NgModuleRef } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

let app: void | NgModuleRef<AppModule>;
async function render() {
  app = await platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
}
if (!(window as any).__POWERED_BY_QIANKUN__) {
  render();
}

export async function bootstrap(props: Object) {
  console.log(props);
}

export async function mount(props: Object) {
  render();
}

export async function unmount(props: Object) {
  console.log(props);
  // @ts-ignore
  app.destroy();
}
```

4. 修改 `webpack` 打包配置

先安装 `@angular-builders/custom-webpack` 插件

```
npm i @angular-builders/custom-webpack@9.2.0 -D
```

在根目录增加 `custom-webpack.config.js`

```js
const appName = require('./package.json').name;
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    library: `${appName}-[name]`,
    libraryTarget: 'umd',
    jsonpFunction: `webpackJsonp_${appName}`,
  },
};
```

修改 `angular.json`，将 `[packageName] > architect > build > builder` 和 `[packageName] > architect > serve > builder`的值改为我们安装的插件，将我们的打包配置文件加入到 `[packageName] > architect > build > options。`

```diff
- "builder": "@angular-devkit/build-angular:browser",
+ "builder": "@angular-builders/custom-webpack:browser",
  "options": {
+    "customWebpackConfig": {
+      "path": "./custom-webpack.config.js"
+    }
  }
```

```diff
- "builder": "@angular-devkit/build-angular:dev-server",
+ "builder": "@angular-builders/custom-webpack:dev-server",
```

### 🚀 非 webpack 构建的微应用

一些非`webpack` 构建的项目，例如 `jQuery` 项目、`jsp` 项目，都可以按照这个处理。

接入之前请确保你的项目里的图片、音视频等资源能正常加载，如果这些资源的地址都是完整路径（例如 `https://qiankun.umijs.org/logo.png）`，则没问题。如果都是相对路径，需要先将这些资源上传到服务器，使用完整路径。

接入非常简单，只需要额外声明一个 `script`，用于 `export` 相对应的 `lifecycles`。例如:

1. 声明 `entry` 入口

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Purehtml Example</title>
</head>
<body>
  <div>
    Purehtml Example
  </div>
</body>
 <script src="./entry.js" entry></script>
</html>
```

2. 在 `entry js` 里声明 `lifecycles`

```js
const render = ($) => {
  $('#purehtml-container').html('Hello, render with jQuery');
  return Promise.resolve();
};

((global) => {
  global['purehtml'] = {
    bootstrap: () => {
      console.log('purehtml bootstrap');
      return Promise.resolve();
    },
    mount: () => {
      console.log('purehtml mount');
      return render($);
    },
    unmount: () => {
      console.log('purehtml unmount');
      return Promise.resolve();
    },
  };
})(window);
```

> 由于 `qiankun` 是通过 `fetch` 去获取微应用的引入的静态资源的，所以必须要求这些静态资源支持[跨域](https://developer.mozilla.org/zh/docs/Web/HTTP/Access_control_CORS)。
>
> 如果是自己的脚本，可以通过开发服务端跨域来支持。如果是三方脚本且无法为其添加跨域头，可以将脚本拖到本地，由自己的服务器 `serve` 来支持跨域。
