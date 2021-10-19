import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import * as echarts from 'echarts'
import vueXlsxTable from 'vue-xlsx-table'
// 引入全局css
import './assets/css/global.less'
// 将全局的echarts对象挂载到vue的原型对象上
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false
Vue.use(vueXlsxTable,{rABS:false})
Date.prototype.format = function (fmt) { //author: meizz   
  var o = {
      "M+": this.getMonth() + 1,                 //月份   
      "d+": this.getDate(),                    //日   
      "h+": this.getHours(),                   //小时   
      "m+": this.getMinutes(),                 //分   
      "s+": this.getSeconds(),                 //秒   
      "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
      "S": this.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
