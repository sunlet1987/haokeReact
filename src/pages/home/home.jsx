import React, { Component } from 'react';
// 从react-router-dom 导入高阶组件withRouter,它可以使没有参加路由的组件获得路由信息
import { Link, withRouter } from 'react-router-dom';
import './home.css';

// 导入轮播图组件
import { Carousel } from 'antd-mobile';

// 导入基地址
import { BASE_URL } from '../../utils';

// 导入数据仓库组件
import store from '../store';

// 导入城市列表选择组件
import City from '../citys/citys'
 

// 创建搜索框组件
class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sCityName:"",
      sClass:"city_wrap"
    };
    this.unsubscribe=store.subscribe(this.fnStoreChange)
  }

  fnSlideUp=(sClass)=>{
    this.setState({ sClass })
  };

  fnStoreChange=()=>{
    this.setState({
      sCityName:store.getState().label
    })
  };

  //取消订阅
  componentWillUnmount() {
    this.unsubscribe()
  }

  componentDidMount(){
    // 先判断sessionStorage中是否存储了当前城市
    // 如果有，就直接使用它里面的值，如果没有，就用百度地图定位后，再发请求获取城市数据
    let sCurrentCity = sessionStorage.getItem('haoke_current_city');

    if(sCurrentCity){
      this.setState({
        sCityName:JSON.parse( sCurrentCity ).label
      });
      //将当前城市存入数据中心
      store.dispatch({
        // chang首字母是小写
        type:"change_city",
        value:JSON.parse(sCurrentCity)
      })
    }else{
      //使用百度地图通过ip定位当前城市
      //在react组件中拿不到BMap对象,我们可以在window对象上去获取BMap
      let BMap=window.BMap;
      let myCity = new BMap.LocalCity();
      myCity.get(async result=>{
        let cityName = result.name;
        // 使用当前城市名称去请求一个接口,检查这个是否在公司业务范围内.有则返回,无则返回上海.
        // 这里name后面需要一个=号.
          let oRes = await this.axios.get('/area/info?name='+cityName);
          this.setState({
            sCityName:oRes.data.body.label
          });
        //同时也存到数据中心
        store.dispatch({
          type:"change_city",
          value:oRes.data.body
        });
      sessionStorage.setItem("haoke_current_city",JSON.stringify(oRes.data.body));
      })
    }
  }
  render() {
    return (
      <div className="search_bar">
        <div className="search_con">
          <span className="city" onClick={ ()=>{ this.fnSlideUp('city_wrap slideUp') } }>{this.state.sCityName}</span>
          <i className="iconfont icon-xialajiantouxiangxia"> </i>
          <span className="village"><i className="iconfont icon-fangdajing" />请输入小区名</span>
        </div>
        <Link to="/map" className="iconfont icon-ic-maplocation-o tomap" onClick={()=>this.props.history.push('/map')}> </Link>

        {/*这里需要写state,不要漏掉了*/}
        <City sClass={ this.state.sClass } fnSwitch={this.fnSlideUp}/>
      </div>
    )
  }
}

// 创建轮播图组件
class Slide extends Component {
  state = {
    data: []

  };

  componentDidMount() {
    this.fnGetData();
  }

  fnGetData = async () => {
    let oRes = await this.axios.get('/home/swiper');
    this.setState({
      data: oRes.data.body

    })
  };

  render() {
    let { data } =this.state;
    return (
      <div className="slide_con">
        {
          data.length>0 && <Carousel
            autoplay={true}
            infinite
          >
            {data.map(item => (
              <Link
                key={item.id}
                to="http://www.itcast.cn"
                style={{ display: 'inline-block', width: '100%', height: '10.6rem' }}
              >
                <img
                  src={ BASE_URL + item.imgSrc }
                  alt=""
                  style={{ width: '100%', verticalAlign: 'top' }}
                />
              </Link>
            ))}
          </Carousel>
        }
      </div>
    )
  }
}


function Menu(){
    return (
        <ul className="menu_con">
          <li>
            <Link to="/"><i className="iconfont icon-zufang1" /></Link>
            <h4>整租</h4>
          </li>
          <li>
            <Link to="/"><i className="iconfont icon-usergroup" /></Link>
            <h4>合租</h4>
          </li>
          <li>
            <Link to="/"><i className="iconfont icon-ic-maplocation-o" /></Link>
            <h4>地图找房</h4>
          </li>
          <li>
            <Link to="/rent"><i className="iconfont icon-zufang" /></Link>
            <h4>去出租</h4>
          </li>
        </ul>
    )
}

//创建租房小组
class Group extends Component {
  state = {
    aList: []
  };
  componentDidMount() {
    this.axios.get("/home/groups?area=AREA%7C88cff55c-aaa4-e2e0").then(res=>{
    //console.log(dat.data.body);
      this.setState({
        aList:res.data.body
      })
    })
  }
  render() {
    let { aList } = this.state;
    return (
        <div className="model2">
          <div className="title_con">
            <h3>租房小组</h3>
            <Link to="javascript;" className="iconfont icon-next"> </Link>
          </div>
          <ul className="house_list">
            {
              aList.map(item=>(
                <li key={item.id}>
                  <p className="fl">{item.title}</p>
                  <img src={BASE_URL+item.imgSrc} alt="" className="fr" />
                  <span className="fl">{item.desc}</span>
                </li>
              ))
            }
        </ul>
      </div>
    )
  }
}

//创建咨询组件
class News extends Component {
  state = {
    aList: []
  };
  componentDidMount() {
    this.fnGetData();
  }
  fnGetData(){
    this.axios.get("/home/news?area=AREA%7C88cff55c-aaa4-e2e0").then(res=>{
      //console.log(dat.data.body);
      this.setState({
        aList:res.data.body
      })
    })
  }
  render() {
    let { aList } = this.state;
    return (
        <div className="model mb120">
          <div className="title_con">
            <h3>最新资讯</h3>
            <Link to="javascript;" className="iconfont icon-next" />
          </div>
          <ul className="list">
            {
              aList.map(item=>(
                <li key={item.id}>
                  <Link to="javascript;"><img src={BASE_URL+item.imgSrc} alt="" /></Link>
                  <div className="detail_list">
                    <h4>{item.title}</h4>
                    <div className="detail">
                      <span>{item.from}</span>
                      <em>{item.date}</em>
                    </div>
                  </div>
                </li>
              ))
            }
          </ul>
        </div>
    )
  }
}

// 通过调用 高阶组件 来 生成 一个 拥有路由信息 的组件
let WithSearchBar = withRouter(SearchBar);

class Home extends Component {
    render() {
        return (
            <div>
                <WithSearchBar />
                <Slide />
                <Menu />
                <Group />
                <News />
            </div>
        );
    }
}
export default Home;
