// 从redux中,导入创建store的方法
import { createStore } from 'redux';
// 导入数据仓库
import reducer from './reducer.js';

// 创建数据仓库管理员
let store = createStore(reducer);

export default store;