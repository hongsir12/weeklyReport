import Vue from 'vue'
import VueRouter from 'vue-router'
import weeklyReportPage from '@/views/weeklyReportPage.vue'

Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'weeklyReport'},
  {path:'/weeklyReport',component:weeklyReportPage}
]

const router = new VueRouter({
  routes
})

export default router
