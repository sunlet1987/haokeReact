import React, { Component, lazy } from 'react';
import { Route, Link } from 'react-router-dom';
import './layout.css';
import Home from '../home/home';

const Houselist = lazy(() => import('../houselist/houselist'));
const Info = lazy(() => import('../info/info'));
const User = lazy(() => import('../user/user'));

class Layout extends Component {
  render() {
    return (
      <div>
        <Route exact path="/layout" component={Home} />
        <Route path="/layout/houselist" component={Houselist} />
        <Route path="/layout/info" component={Info} />
        <Route path="/layout/user" component={User} />
        <footer>
          <ul>
            {/* <li className="active">
                <Link to="/layout" className="iconfont icon-home1"><h4>首页</h4></Link>

            </li>
            <li>
                <Link to="/layout/houselist" className="iconfont icon-ziyuan"><h4>找房</h4></Link>

            </li>
            <li>
                <Link to="/layout/info" className="iconfont icon-zixun"><h4>资讯</h4></Link>
            </li>
            <li>
                <Link to="/layout/user" className="iconfont icon-wode"><h4>我的</h4></Link>
            </li> */}
            {/* 根目录别忘记写斜杠 */}
            <CustomLink label="首页" to="/layout" exact={true} sClass="home1" />
            <CustomLink label="找房" to="/layout/houselist" sClass="ziyuan" />
            <CustomLink label="资讯" to="/layout/info" sClass="zixun" />
            <CustomLink label="我的" to="/layout/user" sClass="wode" />
          </ul>
        </footer>
      </div>
    );
  }
}

function CustomLink({ label, to, exact, sClass }) {
  return <Route
    path={to}
    exact={exact}
    children={({ match }) => (
      <li className={match ? 'active' : ""}>
        <Link to={to} className={"iconfont icon-" + sClass}></Link>
        <h4>{label}</h4>
      </li>
    )}
  />
}

export default Layout;