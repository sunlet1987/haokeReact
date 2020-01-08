import React, { Component } from 'react';
import './houselist.css';
// 导入城市列表选择组件
import Citys from '../citys/citys';
import store from '../store';
import { withRouter } from 'react-router-dom';
import {List,AutoSizer,InfiniteLoader} from 'react-virtualized';
import {BASE_URL} from '../../utils';
import { Toast } from 'antd-mobile';

import notfound from '../../assets/images/not-found.png'

// 导入pickview组件
import { PickerView } from 'antd-mobile';

class TopSearchBar extends Component{
    constructor(props){
        super(props);
        this.state = {
            sCityName:store.getState().label,
            sClass:"city_wrap"
        }
        this.unsubscribe = store.subscribe( this.fnStoreChange )
    }
    fnStoreChange=()=>{
        this.setState({
            sCityName:store.getState().label
        })
    }
    //取消订阅
    componentWillUnmount(){
        this.unsubscribe()
    }

    fnSwitch=(sClass)=>{
        this.setState({
            sClass
        })
    }
    render(){
        return (
            <div className="list_title">
                <span className="back iconfont icon-prev" onClick={ ()=>this.props.history.goBack() }></span>
                <div className="search_con">
                    <span className="city" onClick={()=>{ this.fnSwitch('city_wrap slideUp') }} >{this.state.sCityName}</span>
                    <i className="iconfont icon-xialajiantouxiangxia"></i>
                    <span className="village"><i className="iconfont icon-fangdajing"></i> 请输入小区名</span>
                </div>
                <i className="iconfont icon-ic-maplocation-o tomap" onClick={()=>this.props.history.push('/map') }></i>
                {/* 组件中嵌入城市列表组件，通过props方式给它传递参数 */}
                <Citys sClass={this.state.sClass} fnSwitch={ this.fnSwitch } />
            </div>
        )
    }
}


class FilterBar extends Component{
    constructor(props){
        super(props);
        this.state = {
            // 筛选条的数据
            aFilterData:[
                {'title':'区域','type':'area'},
                {'title':'方式','type':'mode'},
                {'title':'租金','type':'price'},
                {'title':'筛选','type':'more'}
            ],
            // 筛选条的状态
            oFiterState:{
                'area':false,
                'mode':false,
                'price':false,
                'more':false
            },
            // 控制pickview弹框的显示
            bShowPick:false,
            // 控制tags弹框的显示
            bShowTags:false,
            // 存储当前的类型
            sCurrentType:'',
            // 存储所有的过滤条件数据
            oAllFilterData:{},
            // 存储当前PickerView里面的过滤数据
            aCurrentFilterData:[],
            // 存储当前城市
            oCurrentCity:store.getState(),
            // 存储PickerView的列数
            iCols:1,
            //存储tags弹框里面的数据：
            aTagsData:[],
            //存储筛选条中所有选中的值
            oAllFilterVal:{
                'area':['area','null'],
                'mode':['null'],
                'price':['null'],
                'more':[]
            }
        }
        this.unsubscribe = store.subscribe( this.fnStoreChange )
    }

    fnStoreChange=()=>{
        this.setState({
            oCurrentCity:store.getState()
        },()=>{
            // 当前城市设置完成后，再去请求当前城市的过滤数据
            this.fnGetFilterData();
            // 同时清空已选择的过滤条件,同时将过滤条的状态改成初始状态
            this.setState({
                oAllFilterVal:{
                    'area':['area','null'],
                    'mode':['null'],
                    'price':['null'],
                    'more':[]
                },
                oFiterState:{
                    'area':false,
                    'mode':false,
                    'price':false,
                    'more':false
                }
            })

        })
    }

    componentDidMount(){
        this.fnGetFilterData();
    }

    componentWillUnmount(){
        this.unsubscribe()
    }

    fnGetFilterData = async ()=>{
        let oNowFilterData;
        let sNowFilterData = localStorage.getItem('haoke_filter_data'+this.state.oCurrentCity.value);
        if(sNowFilterData){
            oNowFilterData = JSON.parse( sNowFilterData )
        }else{
            let oRes = await this.axios.get('/houses/condition?id='+this.state.oCurrentCity.value);
            oNowFilterData = oRes.data.body;
            localStorage.setItem('haoke_filter_data'+this.state.oCurrentCity.value,JSON.stringify( oNowFilterData ))
        }

        this.setState({
            oAllFilterData:oNowFilterData
        },()=>{
            let { characteristic,floor,oriented,roomType } = this.state.oAllFilterData;
            this.setState({
                aTagsData:[
                    {'title':'户型','data':roomType},
                    {'title':'朝向','data':oriented},
                    {'title':'楼层','data':floor},
                    {'title':'房屋亮点','data':characteristic},
                ]
            })
        })       

        //console.log(oNowFilterData);
    }

    // 定义显示弹框的方法
    fnShowFilters=(sType)=>{
        if(sType==='more'){
            this.setState({
                bShowPick:false,
                bShowTags:true,
                sCurrentType:sType
            })
        }else{

            // 分割数据
            let aCurrentFilterData = [];
            let iCols = 1;
            let {area,subway,price,rentType} = this.state.oAllFilterData;

            if(sType==='area'){
                aCurrentFilterData = [area,subway];
                iCols = 3;
            }else if(sType==='mode'){
                aCurrentFilterData = rentType
            }else{
                aCurrentFilterData = price
            }

            this.setState({
                bShowPick:true,
                bShowTags:false,
                sCurrentType:sType,
                aCurrentFilterData,
                iCols
            }) 
        }
    }

    // 定义隐藏弹框的方法
    fnHiderFilters=()=>{
        this.setState({
            bShowPick:false,
            bShowTags:false,
            // 弹框隐藏时将类型设置为空
            sCurrentType:''
        })
    }

    // 定义方法拿到当前PickerView里面选中的值
    fnGetPickVal=(val)=>{
        //console.log(val);
        // 把选中的中设置的state中的oAllFilterVal中去
        this.setState(state=>{
            let oNowAllFilterVal = state.oAllFilterVal;
            oNowAllFilterVal[state.sCurrentType] = val;
            return {
                // 修改所有过滤的值
                oAllFilterVal:oNowAllFilterVal
            }
        },()=>{
            // 调用方式设置过滤条文字的高亮状态
            this.fnChangeFilterState()
        })

    }

    // 定义方法来设置右侧tags弹框的值
    fnSetTagsVal=(val)=>{
        this.setState(state=>{
            let oNowAllFilterVal = state.oAllFilterVal;
            let aTagsValList = [...oNowAllFilterVal.more];            

            if(aTagsValList.includes(val)){
                aTagsValList = aTagsValList.filter(item=>item!==val)                
            }else{
                aTagsValList.push(val)
            }

            oNowAllFilterVal.more = aTagsValList;           

            return {
                // 修改所有过滤的值
                oAllFilterVal:oNowAllFilterVal
            }

        },()=>{
            // 调用方式设置过滤条文字的高亮状态
            this.fnChangeFilterState()
        })
    }


    // 定义方法来改变过滤条文字高亮的状态
    fnChangeFilterState=()=>{
        this.setState(state=>{
            let oNewFiterState = state.oFiterState;
            let oNowAllFilterVal = state.oAllFilterVal;

            if(oNowAllFilterVal.area[0]==='area'&&oNowAllFilterVal.area[1]==='null'){
                oNewFiterState.area = false;
            }else{
                oNewFiterState.area = true;
            }

            if(oNowAllFilterVal.mode[0]==='null'){
                oNewFiterState.mode = false;
            }else{
                oNewFiterState.mode = true;
            }

            if(oNowAllFilterVal.price[0]==='null'){
                oNewFiterState.price = false;
            }else{
                oNewFiterState.price = true;
            }

            if(oNowAllFilterVal.more.length===0){
                oNewFiterState.more = false;
            }else{
                oNewFiterState.more = true;
            }

            return {
                oFiterState:oNewFiterState
            }
        })

    }

    // 定义方法来处理最终的数据
    fnSetParams=()=>{
        this.setState(state=>{
            /* 
                目前的数据结构：
                {
                    'area':['area','null'],
                    'mode':['null'],
                    'price':['null'],
                    'more':[]
                }

                需要的数据结构
                {
                    'area':'null',  或者是 'subway':'null'  或者是：'area':'area|7Cd1a00384-5801-d5kl'
                    'rentType':'null'  或者是  'rentType':'true',
                    'price':'2000',
                    'more':'7Cd1a00384-5801-sdf76,7Cd1a00384-5801-d590,7Cd1a00384-5801-d5kl'
                }
            */

            let oNowFilterVal = state.oAllFilterVal;
            let oParams = {}

            if( oNowFilterVal.area[2]===undefined ){
                oParams[oNowFilterVal.area[0]] = 'null'
            }else if(oNowFilterVal.area[2]==='null'){
                oParams[oNowFilterVal.area[0]] = oNowFilterVal.area[1]
            }else{
                oParams[oNowFilterVal.area[0]] = oNowFilterVal.area[2]
            }

            oParams.rentType = oNowFilterVal.mode[0];
            
            if( oNowFilterVal.price[0]==='null' ){
                oParams.price = 'null';
            }else{
                oParams.price = oNowFilterVal.price[0].split('|')[1];
            }

            oParams.more = oNowFilterVal.more.join(',');

            //console.log(oParams);

            this.props.fnGetParams(oParams);

            return {
                bShowPick:false,
                bShowTags:false,
                // 弹框隐藏时将类型设置为空
                sCurrentType:''
            }

        })

    }

    render(){
        let {
            aFilterData,  // 筛选条的数据
            oFiterState,  // 筛选条的状态
            bShowPick,    // 控制pickview弹框的显示
            bShowTags,     // 控制tags弹框的显示
            sCurrentType,  // 存储当前的类型
            aCurrentFilterData, // 存储当前PickerView里面的过滤数据
            iCols,  //存储PickerView的列数
            aTagsData,      //存储tags弹框里面的数据
            oAllFilterVal //存储筛选条中所有选中的值          

        } = this.state;
        return (
            <>
                {/* 筛选条的结构 */}
                <ul className="filter_list">
                    {
                        aFilterData.map(item=>(
                              <li className={ (oFiterState[item.type]?"active ":"")+((sCurrentType===item.type)?"current":"") } key={ item.type} onClick={ ()=>this.fnShowFilters(item.type) }>
                                <span>{item.title}</span>
                                <i className="iconfont icon-xialajiantouxiangxia"></i>
                            </li>
                        ))
                    }
                </ul>

                {/* 前面三个类型(area,mode,price)点击的弹框结构 */}
                <div className={bShowPick?"slide_pannel pannel_in":"slide_pannel pannel_out"}>
                    <div className="slide_comp">
                        <PickerView
                            data={aCurrentFilterData}
                            cascade={true}
                            cols = {iCols}
                            onChange = { this.fnGetPickVal }
                            value = { oAllFilterVal[sCurrentType] }
                        />
                    </div>
                    <div className="slide_btns">
                        <span onClick={ this.fnHiderFilters }>取消</span>
                        <b onClick={ this.fnSetParams }>确定</b>
                    </div>
                </div>
                <div className={bShowPick?"mask mask_in":"mask mask_out"}  onClick={ this.fnHiderFilters }></div>

                {/* 点击筛选弹出的弹框的结构 */}
                <div className={bShowTags?"tags_pannel tags_pannel_in":"tags_pannel tags_pannel_out"}>
                    <div className="tags_list">
                        {
                            aTagsData.map(item=>(
                                <div key={ item.title }>
                                     <h3>{item.title}</h3>
                                    <div className="ul_wrap">
                                        <ul>
                                            {
                                                item.data.map(Val=><li 
                                                    className={( oAllFilterVal.more.includes( Val.value ) )?"active":""} 
                                                    key={Val.value}
                                                    onClick={ ()=>this.fnSetTagsVal( Val.value ) }
                                                >{Val.label}</li>)
                                            }                                           
                                        </ul>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="tags_btns">
                        <span onClick={ this.fnHiderFilters }>取消</span>
                        <b  onClick={ this.fnSetParams }>确定</b>
                    </div>
                </div>    
                <div className={bShowTags?"mask2 mask_in":"mask2 mask_out"} onClick={ this.fnHiderFilters }></div>    
            </>
        )
    }
}


let WithTopSearchBar = withRouter(TopSearchBar);
class Houselist extends Component {
    constructor(props){
        super(props);
        this.state={
            aHouseList:[],
            sCurrentCity:store.getState().value,
            // 存储返回的数据总条数：
            iCount:0,
            // 表示初始的数据是否加载完成
            bIsloaded:false
        }
        this.params = {};
        this.unsubscribe = store.subscribe( this.fnStoreChange )
    }

    fnStoreChange=()=>{
        this.setState({
            sCurrentCity:store.getState().value
        },()=>{
            this.fnGetParams({});
        })
    }

    componentDidMount(){
        this.fnGetParams({});
    }

    componentWillUnmount(){
        this.unsubscribe()
    }

    fnGetParams=async params=>{
        this.params = params;
        Toast.loading('loading...',0);
        //console.log('父组件得到的参数',params);
        let oRes = await this.axios.get('/houses',{
            params:{
                ...params,
                cityId:this.state.sCurrentCity,
                start:1,
                end:20
            }
        })
        Toast.hide();
        //console.log(oRes.data.body);
        this.setState({
            aHouseList:oRes.data.body.list,
            iCount:oRes.data.body.count,
            bIsloaded:true

        },()=>{
            // 让长列表滚动到顶部
            this.list.scrollToRow(0);
        })
    }

    rowRenderer=({key, index, style})=>{    
        let item = this.state.aHouseList[index];

        // 如果index索引值对应的数据还没有加载完，item的值就会是undefined，这个时候，我们可以用空的div代替原来的结构
        if(!item){
            return <div className="reload" key={key} style={ style }><div>loading....</div></div>
        }

        return (
                <div className="house_wrap" key={key} style={style} onClick={()=>this.props.history.push('/detail/'+item.houseCode) }>
                    <div className="house_item">
                        <div className="imgWrap">
                            <img className="img" src={BASE_URL + item.houseImg} alt="" />
                        </div>
                        <div className="content">
                            <h3 className="title">{item.title}</h3>
                            <div className="desc">{item.desc}</div>
                            <div>
                                {
                                    item.tags.map((Val,i)=> <span className={"tag tag"+i} key={i}>{Val}</span>)
                                }
                            </div>
                            <div className="price">
                                <span className="priceNum">{item.price}</span> 元/月
                            </div>
                        </div>
                    </div>
                </div>
        );
    }


    // 定义InfiniteLoader里面判断某一行是否加载的方法
    // 这个方法的作用原来不用去管，只要这么写出来就可以了
    isRowLoaded=({ index })=>{
        return !!this.state.aHouseList[index];
    }

    // 定义InfiniteLoader中加载更多行的方法
    loadMoreRows=({ startIndex, stopIndex })=>{
        return this.axios.get('/houses',{
            params:{
                ...this.params,
                cityId:this.state.sCurrentCity,
                start:startIndex,
                end:stopIndex
            }
        }).then(dat=>{
            this.setState(state=>{
                return {
                    aHouseList:[...state.aHouseList,...dat.data.body.list],
                    iCount:dat.data.body.count
                }
            })
        })
    }

    render() {
        let { iCount} = this.state;
        return (
            <>
                <WithTopSearchBar />
                <FilterBar fnGetParams={ this.fnGetParams } />
                <div className="house_list_con">
                <InfiniteLoader
                    isRowLoaded={this.isRowLoaded}
                    loadMoreRows={this.loadMoreRows}
                    rowCount={iCount}
                >
                {({ onRowsRendered, registerChild }) => (

                    <AutoSizer>
                        {({height, width}) => (
                            <List
                                onRowsRendered={onRowsRendered}
                                // 参数list是InfiniteLoader组件创建的dom对象,它指的就是List标签对象
				                ref={(list)=>{
                                //把list对象绑定到this上方便其他方法调用list对象
                                this.list = list;
                                // 同时把list对象通过registerChild(list)给到InfiniteLoader组件，让它内部可以调用list对象
                                registerChild(list);
                                }}
                                width={width}
                                height={height}
                                rowCount={iCount}
                                rowHeight={120}
                                rowRenderer={this.rowRenderer}
                            /> 
                        )}
                    </AutoSizer>
                )}
                </InfiniteLoader>
                {
                    (this.state.bIsloaded && this.state.aHouseList.length===0) && <div className="notfound">
                        <img src={notfound} alt="notfound" />
                        <p>没有找到房源，请你换个搜索条件吧~</p>
                    </div>
                }
                </div>
            </>
        );
    }
}

export default Houselist;
