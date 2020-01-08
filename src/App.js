import React, { Suspense, lazy } from 'react';
import { HashRouter, Route, Redirect, Switch, withRouter } from 'react-router-dom';
import Layout from './pages/layout/layout.jsx';

const Map = lazy(() => import('./pages/map/map'));
const Detail = lazy(() => import('./pages/detail/detail'));
const Login = lazy(() => import('./pages/login/login'));
const Rent = lazy(() => import('./pages/rent/rent'));
const Zlist = lazy(() => import('./pages/rentlist/rentlist'));


let WithRent = withRouter(Rent);
let WithLogin = withRouter(Login);

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route path="/layout" component={Layout} />
          <Route path="/map" component={Map} />
          <Route path="/detail/:houseCode" component={Detail} />
          <Route path="/login" component={Login} />
          <Route path="/zlist" component={Zlist} />

          // 路由拦截,使用render方法去判断
          <Route path="/rent" render={() => {
            let token = localStorage.getItem('haoke_token');
            if (token) {
              return <WithRent />
            } else {
              return <WithLogin />
            }
          }} />
          <Redirect exact from="/" to="/layout" />
        </Switch>
      </Suspense>
    </HashRouter>
  );
}

export default App;
