import React, {
	Component
} from 'react';
import ReactDOM from 'react-dom';
import App from './App';
// 引入全局的样式重置
import './assets/css/reset.css';
// 引入设置rem的js文件
import './assets/js/set_root';
// 引入全局的字体图标
import './assets/css/iconfont.css';
// 引入全局的antd-mobile图标
import 'antd-mobile/dist/antd-mobile.css';

import axios from 'axios';

// 导出存储的baseURL
import {
	BASE_URL
} from './utils/'

// 设置axios的BASE_URL基地址
axios.defaults.baseURL = BASE_URL;

// 定义个需要加token的请求路径的数组
let aTokenUrl = ['/user', '/user/logout','/user/houses']

// 给axios加上请求拦截器,根据对应的地址加上token
axios.interceptors.request.use(config => {
	let token = localStorage.getItem("haoke_token");
	if (token) {
		let sUrl = config.url;
		if (aTokenUrl.includes(sUrl)) {
			config.headers.authorization = token
		}
	}
	//console.log(config.url);
	return config
})

// 将axios方法绑定在Component类的原型上,这样所有的组件都会有axios方法bundleRenderer.renderToStream
Component.prototype.axios = axios;

ReactDOM.render( < App / > , document.getElementById('root'))
