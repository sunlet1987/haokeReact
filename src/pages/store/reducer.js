// state是数据,action是提交的工单
// 这里要设置初始值,不然获取初始值为undefined,就会报错.
let reducer =(state={label:"深圳",value:"AREA|a6649a11-be98-b150" },action) => {
  if(action.type==="change_city"){
    return action.value; 
  }
  return state;
};
export default reducer;


