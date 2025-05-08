import { createRouter, createWebHistory } from 'vue-router'
import Profile from '../views/Profile.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import HelpSupport from '../views/Profile.vue'
import History from '../views/History.vue'
import Game from '../views/Game.vue'
import { getAuth } from 'firebase/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/HelpSupport',
    name: 'HelpSupport',
    component: HelpSupport,

  },
  {
    path: '/Profile',
    name: 'Profile',
    component: Profile,
   
  },
  {
    path: '/Game',
    name: 'Game',
    component: Game,

  },

  {
    path: '/History',
    name: 'History',
    component: History,

  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const auth = getAuth();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !auth.currentUser) {
    next('/login');
  } else {
    next();
  }
})

export default router

