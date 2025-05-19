import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue' // Sử dụng đường dẫn tương đối
import LoginScreen from '../views/LoginScreen.vue'
import SignupScreen from '../views/SignupScreen.vue'
import UserProfile from '../views/UserProfile.vue'
import Cart from '@/views/Cart.vue'
import ProductScreen from '@/views/ProductScreen.vue'
import AdminUsers from '@/views/AdminUsers.vue'
import AdminProducts from '@/views/AdminProducts.vue'
import AdminCategory from '@/views/AdminCategory.vue'
import AdminOrders from '@/views/AdminOrders.vue'
import ProductList from '@/views/ProductList.vue'
import ResetPass from '@/views/ResetPass.vue'
import Bill from '@/views/Bill.vue'
// import { patch } from 'node_modules/axios/index.cjs'


const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginScreen },
  { path: '/signup', component: SignupScreen },
  {path: '/profile', component: UserProfile},
  { path: '/product/:id', component: ProductScreen },
  {path: '/cart',component: Cart},
  {path: '/admin/users',component: AdminUsers},
  {path: '/admin/products',component: AdminProducts},
  {path: '/admin/categories',component: AdminCategory},
  {path: '/admin/orders',component: AdminOrders},
  {path: '/products',component: ProductList},
  {path: '/resetpassword',component: ResetPass},
  {path: '/bills/:id',component: Bill}
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
