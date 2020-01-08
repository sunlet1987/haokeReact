import React from 'react';
import styles from '../login/login.module.css';
import logo from '../../assets/images/login_title.png'

// 导入formik来出来表单
import { withFormik } from 'formik';
import axios from 'axios';
import { BASE_URL } from '../../utils';
import { Toast } from 'antd-mobile';
// 导入表单校验组件
import * as yup from 'yup';



// 函数式组件
const Login = props => {
		// touched是一个对象，它里面存储了表单是否操作过的布尔值
		const { values,handleChange,handleSubmit,errors,handleBlur,touched } = props;
		console.log(touched)
		
    return (
      <div>
        <div className={styles.login_wrap}>
          <span className={[styles.back,'iconfont','icon-prev'].join(' ')}></span>
          <div className={styles.login_title}>
            <img src={logo} alt="login" />
          </div>
          <form className={styles.login_form}>
            <div className={styles.form_group}>
              <input 
							type="text" 
							placeholder="用户名" 
							value={values.username}
							onChange={handleChange}
							name="username"
							// 关掉表单的联想功能
							autoComplete="off"
							// 绑定onBlur事件是为了判断表单是否操作过,是否操作过的布尔值存储在touched对象中
							onBlur = {handleBlur}
							/>
							{
								errors.username && touched.username && <p className={styles.err_tip}>{errors.username}</p>
							}
              
              <input 
							type="password" 
							placeholder="密码" 
							value={values.password}
							onChange={handleChange}
							name="password"
							onBlur = {handleBlur}
							/>
							{
								errors.password && touched.password && <p className={[styles.err_tip,styles.err_pass_tip].join(' ')}>{errors.password}</p>
							}  
            </div>
            <input type="button" value="登 录" className={styles.input_sub} onClick={handleSubmit} disabled={ errors.username || errors.password }/>
          </form>
          <div className={styles.register}>新用户注册</div>
          <div className={styles.findpass}>忘记密码</div>
        </div>
      </div>
    );
  
}
	// 定义校验用户名和密码的正则表达式
	let reName = /^\w{5,10}$/;
	let rePass = /^\w{5,15}$/;
	
// 高阶组件可以跟2层参数，即后面跟2个括号
// 高阶组件发送axios，会拿不到this，需要单独导入axios，但是可以拿到props
// 单独导入axios，使得请求路径没有配置及地址，需要单独导入基地址

let withLogin = withFormik({
	mapPropsToValues:()=>({username:"",password:""}),
	// 加上表单校验:
	validationSchema:yup.object().shape({
		username:yup.string().required('用户名不能为空!').matches(reName,'用户名是5到10位的数字、字母和下划线'),
		password:yup.string().required('密码不能为空!').matches(rePass,'密码是5到15位的数字、字母和下划线')
	}),
	
	handleSubmit:async (values,{props})=>{
		// console.log(values);
		let oRes =await axios.post(BASE_URL+'/user/login',values);
		console.log(oRes)
		let {status,body,description} = oRes.data;
		if(status===200){
			Toast.info("登录成功！",2,()=>{
				localStorage.setItem('haoke_token',body.token)
				
				props.history.goBack();
				})
		}else{
			Toast.info(description,2)
		}
	},
	})(Login);

export default withLogin;