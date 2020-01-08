import React, { Component } from 'react';
import './map.css';
import store from '../store';
import { Toast } from 'antd-mobile';
import { BASE_URL } from '../../utils'

// 给全局变量window添加要给方法
let BMap = window.BMap;

class Map extends Component {
    state = {
        oCurrentCity: store.getState(),
        sClass: 'houseList',
        aHouseList: []
    };

    componentDidMount() {

        // 创建地图实例,考虑到很多地方都要待用map实例.直接挂在到 Map 组件中.即this.map
        this.map = new BMap.Map("baidu_map");

        // 在地图上绑定一个移动事件，如果地图移动，就将sClass的值设置为原始值
        this.map.addEventListener('movestart', () => {
            this.setState({
                sClass: 'houseList'
            })
        })

        //定义一个初始化的地图缩放比例，存在this上
        this.level = 11;
        //console.log( store.getState() );

        // 从state中拿到当前城市名称
        let sNowCurrentCity = this.state.oCurrentCity.label;

        // 通过当前城市名称得到坐标点
        // 创建地址解析器实例
        let myGeo = new BMap.Geocoder();

        // 将地址解析结果显示在地图上，并调整地图视野
        myGeo.getPoint(sNowCurrentCity, point => {
            if (point) {
                // 添加控件
                this.map.addControl(new BMap.NavigationControl());
                //增加地图缩放按钮
                this.map.addControl(new BMap.ScaleControl());

                //调用给地图增加文字标注的方法
                //同时传入当前城市的id，当前城市的坐标点，以及初始的缩放级别
                this.fnAddOverLay(this.state.oCurrentCity.value, point, this.level);
            }
        }, sNowCurrentCity);
    }

    // 定义一个方法来在地图上添加文字标注
    fnAddOverLay = async (id, point, level) => {
        // 判断是否传递了level参数，同时设置this.level的值
        // 地区分为区 镇 和 小区 三个级别
        // 区的缩放比是11，镇的缩放比是13，小区的缩放比是15
        if (level) {
            this.level = 11;
        } else {
            if (this.level === 11) {
                this.level = 13
            } else if (this.level === 13) {
                this.level = 15
            }
        }
        // 通过得到的点来显示地图
        this.map.centerAndZoom(point, this.level);

        // 开启loading
        // 0 表示不设置时间，null表示没有回调函数，false表示不自动关闭
        Toast.loading('loading...', 0, null, false);

        // 通过区域id去请求房屋数据
        let oRes = await this.axios.get('/area/map?id=' + id);

        // 关闭loading
        Toast.hide();

        // console.log(oRes.data.body);
        let aHouseList = oRes.data.body;

        aHouseList.map(item => {
            // 拿出点的经度和纬度值：
            let { longitude, latitude } = item.coord;
            // 通过经度和纬度的点创建一个百度地图的坐标点
            let pos = new BMap.Point(longitude, latitude);

            let opts;    //设置文本偏移量
            let label;

            // 如果是级别一和二的数据，就渲染成圆形的标签，如果是级别三，就渲染成方形的标签
            if (this.level !== 15) {
                opts = {
                    position: pos,	// 指定文本标注所在的地理位置
                    offset: new BMap.Size(-37, -37)	//设置文本偏移量
                }
                label = new BMap.Label("<div class='map_label01'>" + item.label + "<br>" + item.count + "套</div>", opts);  // 创建文本标注对象

                //给label绑定点击事件
                label.addEventListener('click', () => {
                    // alert(item.label);
                    // 传入地区的id，以及label的中心点
                    this.fnRefreshMap(item.value, pos)
                })

                label.setStyle({
                    border: "0px",
                    backgroundColor: 'transparent'
                });
                this.map.addOverlay(label);
            } else {
                opts = {
                    position: pos,    // 指定文本标注所在的地理位置
                    offset: new BMap.Size(-60, -53)    //设置文本偏移量
                }
                label = new BMap.Label("<div class='map_label02'>" + item.label + "&nbsp;&nbsp;&nbsp;" + item.count + "套</div>", opts);  // 创建文本标注对象

                // 给label绑定点击事件
                label.addEventListener('click', (e) => {
                    //console.log(e.changedTouches[0]);
                    // 定义变量来存储地图x轴和y轴移动的距离
                    let iMoveX, iMoveY

                    // 加上程序健壮性优化
                    try {
                        let { clientX, clientY } = e.changedTouches[0];
                        iMoveX = window.innerWidth / 2 - clientX;
                        iMoveY = window.innerHeight / 4 - clientY;
                    } catch (err) {
                        let { clientX, clientY } = e;
                        iMoveX = window.innerWidth / 2 - clientX;
                        iMoveY = window.innerHeight / 4 - clientY;
                    }

                    //console.log(clientX,clientY);
                    // 显示房屋列表
                    this.fnShowHouseList(item.value, { iMoveX, iMoveY });
                })
                label.setStyle({
                    border: "0px",
                    backgroundColor: 'transparent'
                });
                this.map.addOverlay(label);
            }
        })
    }
    // 定义一个方法，首先清除地图上的覆盖物，然后再调用fnAddOverLay
    fnRefreshMap = (id, point) => {
        // 清空地图上面的覆盖物
        // 使用定时器是为了解决它里面报错的问题
        setTimeout(() => {
            this.map.clearOverlays();
        }, 0);
        this.fnAddOverLay(id, point);
    }

    fnShowHouseList = async (id, cors) => {
        // 让地图移动到对应像素尺寸的位置
        this.map.panBy(cors.iMoveX, cors.iMoveY);

        Toast.loading('loading...', 0);
        let oRes = await this.axios.get('/houses?cityId=' + id);
        //console.log(oRes.data.body)
        Toast.hide();

        this.setState({
            sClass: 'houseList houseListShow',
            aHouseList: oRes.data.body.list
        })
    }

    render() {
        let { sClass, aHouseList } = this.state;
        return (
            <div>
                <div className="common_title">
                    <span className="back iconfont icon-prev" onClick={() => this.props.history.goBack()}></span>
                    <h3>地图找房</h3>
                </div>
                <div className="map_com">
                    <div style={{ 'width': '100%', 'height': '100%' }} id="baidu_map"></div>
                </div>
                <div className={sClass}>
                    <div className="titleWrap">
                        <h1 className="listTitle">房屋列表</h1>
                        <a className="titleMore" href="/house/list">
                            更多房源
                        </a>
                    </div>
                    <div className="houseItems">
                        {
                            aHouseList.map(item => (
                                <div className="house" key={item.houseCode} onClick={()=>this.props.history.push('/detail/'+item.houseCode) }>
                                    <div className="imgWrap">
                                        <img className="img" src={BASE_URL + item.houseImg} alt="" />
                                    </div>
                                    <div className="content">
                                        <h3 className="title">{item.title}</h3>
                                        <h3 className="desc">{item.desc}</h3>
                                    </div>
                                    <div>
                                        {
                                            item.tags.map((Val, i) => (
                                                <span className={"tag tag" + i} key={i}>{Val}</span>
                                            ))
                                        }
                                    </div>
                                    <div className="price">
                                        <span className="priceNum">{item.price}</span>元/月
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        )
    }
}

export default Map