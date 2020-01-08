import React, { Component } from 'react';
import './citys.css';
import store from '../store';
import { List, AutoSizer } from 'react-virtualized'
import { Toast } from 'antd-mobile';

class Citys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oCityList: {},
      aCityKeys: [],
      // 这个变量存储当前滚动到的索引值
      oCurrentCity: {},
      iCurrent: 0,
    };
    // 在this上面帮定一个值来存储右边的的字母的是否点击
    this.bIsClick = true;
    // 创建获取元素的方法
    this.oListRef = React.createRef();
    // 返回取消订阅的方法
    this.unsubscribe = store.subscribe(this.fnStoreChange)
  }

  fnStoreChange = () => {
    this.setState(state => {
      let oNowCityList = JSON.parse(JSON.stringify(state.oCityList));
      oNowCityList['#'] = [state.oCurrentCity];
      
      return {
        oCityList: oNowCityList
      }
    });
  };

  componentWillUnmount() {
    this.unsubscribe()
  }

  componentDidMount() {
    this.fnGetCityData().then(r =>{})
  }

  fnFormatData = (aList) => {
    let oCityList = {};
    /*
     目前的数据结构：
     [
     {label: "北京", value: "AREA|88cff55c-aaa4-e2e0", pinyin: "beijing", short: "bj"},
     {label: "安庆", value: "AREA|b4e8be1a-2de2-e039", pinyin: "anqing", short: "aq"},
     {label: "南宁", value: "AREA|2bc437ca-b3d2-5c3c", pinyin: "nanning",short: "nn"},
     ]
     需要的数据结构：
     {
     hot:[],
     a:[{label: "安庆", value: "AREA|b4e8be1a-2de2-e039", pinyin: "anqing", short: "aq"}],
     b:[{label: "北京", value: "AREA|88cff55c-aaa4-e2e0", pinyin: "beijing", short: "bj"},{label: "保定", value: "AREA|88cff55c-aaa4-e2e0", pinyin: "保定", short: "bd"}],
     c:[{label: "长沙"....}]
     }
     */
    aList.map(item=>{
      let sFirstLetter = item.short.substr(0,1);
      // 判断oCityList对象中是否包含某个键
      if( sFirstLetter in oCityList ){
        return oCityList[sFirstLetter].push( item )
      }else{
        return  oCityList[sFirstLetter] = [item];
      }
		})
    // Object.keys 方法可以将对象中的键分别拿出来生成一个数组
    let aCityKeys = Object.keys(oCityList).sort();
    return { oCityList, aCityKeys };
  };

  fnGetCityData = async () => {
    let aNowCityList;
    // 获取本地城市列表数据
    let sNowCityList = localStorage.getItem('haoke_city_data_list');
    if (sNowCityList) {
      // 如果本地有当前城市数据,就转化成数组.
      aNowCityList = JSON.parse(sNowCityList);
    } else {
      // 如果本地没有数据,发送请求去服务器获取数据
      let oRes = await this.axios.get('/area/city?level=1');
      // 将从服务器获取的数据赋值给当前城市的列表
      aNowCityList = oRes.data.body;
      // 再次把从服务器获取的城市列表数据保存到本地
      localStorage.setItem('haoke_city_data_list', JSON.stringify(oRes.data.body))
    }
      //console.log(oRes.data.body);
      // 得到格式化的数据
      let { oCityList, aCityKeys } = this.fnFormatData(aNowCityList);

      // 获取热门城市数据
      let oRes2 = await this.axios.get('/area/hot');

      // 将热门城市数据放到格式化数据中
      oCityList['hot'] = oRes2.data.body;
      aCityKeys.unshift('hot');

      // 去store数据中心监听 当前城市数据 的改变.作为新的当前城市.
      let oCurrentCity = store.getState();

      // 并把刚切换城市 替换 上一次城市列表数组第#号元素.
      oCityList['#'] = [oCurrentCity];
      // 并将#复制给右侧的索引
      aCityKeys.unshift('#');

      // 将最终拼装好的数据存到state中
      this.setState({
        oCityList,
        aCityKeys,
        oCurrentCity
      })
      // console.log(oCityList,aCityKeys);
  };

  fnSetKeyName=(sTr)=>{
    if(sTr==='#'){
      return '当前城市'
    } else if(sTr==='hot'){
      return '热门城市'
    }else{
      return sTr.toUpperCase()
    }
  };
  fnChangeCity = async sCityName => {
    // 判断点击的城市是否是当前城市,如果点击的城市和数据中心的当前城市名一致,说明点击的是同一个城市.
    if (sCityName === this.state.oCurrentCity.label) {
      Toast.info('当前城市已选', 2)
    } else {
      // 如果不是同一个城市.就从本地获城市数据
      let oCurrentCity;
      let sNowCity = localStorage.getItem('haoke_city' + sCityName);
      if (sNowCity) {
        // 判断:如果本地没有数据.
        oCurrentCity = JSON.parse(sNowCity);
      } else {
        let oRes = await this.axios.get('/area/info?name=' + sCityName);
        oCurrentCity = oRes.data.body;
        localStorage.setItem('haoke_city' + sCityName, JSON.stringify(oCurrentCity));
      }
      // 如果传入的城市不是上海,但是返回的是上海的城市信息,说明传入的城市不在公司业务范围内容
      if (sCityName !== '上海' && oCurrentCity.label === '上海') {
        Toast.info("没有当前城市的数据!", 2)
      } else {
        // 同时将返回的城市信息存储到sessionStorage中
        sessionStorage.setItem('haoke_current_city', JSON.stringify(oCurrentCity));
        // 把切换城市,修改数据中心的当前城市
        this.setState({ oCurrentCity },()=>{
          store.dispatch({
            type: "change_city",
            value: oCurrentCity
          }) 
        });
        // 关掉城市列表页面
        this.props.fnSwitch('city_wrap');

      }
    }
  };

  // 定义react-virtualized渲染结构的方法
  // key是函数自动生成的key,index是函数自动生成的索引值,style是函数内部生成的样式,这个三个参数必须填写
  rowRenderer = ({ key, index, style }) => {
    let sLetter = this.state.aCityKeys[index];
    let aNowList = this.state.oCityList[sLetter];
    // console.log(aNowList);
    return (
      <div className="city_group" key={key} style={style}>
        <h4>{this.fnSetKeyName(sLetter)}</h4>
        <ul>
          {
            aNowList.map(Val => <li onClick={() => { this.fnChangeCity(Val.label) }} key={Val.value}>{Val.label}</li>)
          }
        </ul>
      </div>
    );
  };

  // 定义方法来计算每一行的高度
  fnCountHeight = ({ index }) => {
    let sLetter = this.state.aCityKeys[index];
    let iLen = this.state.oCityList[sLetter].length;
    return 40 + 58 * iLen
  };

  // 定义点击字母滚动到的对应的行
  fnScrollTo = (i)=>{
    // 设置bIsClick为false,让onRowsRendered方法失效
    this.bIsClick = false;
    this.oListRef.current.scrollToRow(i);
    this.setState({
      iCurrent: i
    });
    setTimeout = (()=>(this.bIsClick = true), 200)
  };

  // 定义滚动时自动触发的方法
  onRowsRendered = ({ startIndex,stopIndex }) => {
    if(this.bIsClick){
      this.setState({
        iCurrent: startIndex
      })
    }
  };

  render() {
    let { aCityKeys, iCurrent } = this.state;
    return (
      <div className={this.props.sClass}>
        <div className="city_title">
          <span className="shutoff iconfont icon-shut" onClick={() => this.props.fnSwitch('city_wrap')}> </span>
          <h3>选择城市</h3>
        </div>

        <div className="group_con">
          <AutoSizer>
            {({ height, width }) => (
              <List
                ref={this.oListRef}
                width={width}
                height={height}
                rowCount={aCityKeys.length}
                rowHeight={this.fnCountHeight}
                rowRenderer={this.rowRenderer}
                scrollToAlignment={"start"}
                // 关联滚动是自动触发的方法
                onRowsRendered={this.onRowsRendered}
              />
            )}
          </AutoSizer>
        </div>
        <ul className="city_index">
          {
            aCityKeys.map((item, i) => <li className={(i === iCurrent) ? "active" : ""} key={item} onClick={() => this.fnScrollTo(i)}><span>{item === 'hot' ? '热' : item.toUpperCase()}</span></li>)
          }
        </ul>
      </div>
    );
  }
}
export default Citys