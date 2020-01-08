import React, { Component } from 'react';
import './user.css';
import avatar02 from '../../assets/images/avatar02.png';
import join from '../../assets/images/join.png';
import { BASE_URL } from '../../utils'

// 导入弹框组件
import { Modal } from 'antd-mobile';

class User extends Component {
  constructor(props){
    super(props)
    this.state={
      oUserInfo:{},
      bIsloaded:false
    }
  }

  componentDidMount(){
		let token = localStorage.getItem('haoke_token');
		if(token){
			this.fnGetUserInfo(token)
		}
  }
	
	fnGetUserInfo=async ()=>{
		let oRes = await this.axios.get('/user')
			console.log(oRes);
			let { body,status }=oRes.data
			if(status===200){
				this.setState({
					oUserInfo:body,
					bIsloaded:true
				})
			}
	}
	
	fnLogout=()=>{
	  Modal.alert('用户退出', '你确认退出吗?', [
	    { text: '取消'},
	    { text: '确定', onPress: async() => {
	    	//console.log('用户退出！')
	    	let oRes = await this.axios.post('/user/logout');
        // console.log(oRes);
        let { status } = oRes.data;

        if(status===200){
				// 删除本地的token
				localStorage.removeItem('haoke_token');
         this.setState({
            oUserInfo:{},
            bIsloaded:false
          })
        }
	}},
	  ])
	}
	
  render() {
		let {oUserInfo,bIsloaded}=this.state;
    return (
        <div className="user_wrap">
            <div className="user_header">
							{
								bIsloaded?(
									<div className="info_pannel">
										<img src={BASE_URL+oUserInfo.avatar} alt="" />
										<div className="role">{oUserInfo.nickname}</div>
										<span className="gologin" onClick={this.fnLogout}>退出</span>
									</div>
								):(
									<div className="info_pannel">
										<img src={avatar02} alt="" />
										<div className="role">游客</div>
										<span className="gologin" onClick={()=>this.props.history.push('/login')}>去登录</span>
									</div>
								)
							}
            </div>
            <ul className="opt_list">
                <li>
                    <i className="iconfont icon-shoucang"></i>
                    <span>我的收藏</span>
                </li>
                <li>
                    <i className="iconfont icon-home"></i>
                    <span>我的出租</span>
                </li>
                <li>
                    <i className="iconfont icon-shijian"></i>
                    <span>看房记录</span>
                </li>
                <li>
                    <i className="iconfont icon-fangdong"></i>
                    <span>成为房主</span>
                </li>
                <li>
                    <i className="iconfont icon-wode"></i>
                    <span>个人资料</span>
                </li>
                <li>
                    <i className="iconfont icon-kefu"></i>
                    <span>联系我们</span>
                </li>
            </ul>
            <div className="join">
                <img src={join} alt="" />
            </div>
        </div>
    );
  }
}

export default User;
