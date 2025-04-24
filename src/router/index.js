import { createRouter, createWebHistory } from 'vue-router'
import Profile from '../views/Profile.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import HelpSupport from '../views/Profile.vue'
import History from '../views/History.vue'
import Game from '../views/Game.vue'



const routes = [
  {
    path: '/',
    redirect: '/Login',  // Ensure this redirects to Login
    meta: { layout: 'empty' }
  },
  {
    path: '/Dashboard',
    name: 'Dashboard',
    component: Dashboard,
    //  meta: { requiresAuth: true } // Only authenticated users can access this
   
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
  
  {
    path: '/Login',
    name: 'Login',
    component: Login,
    meta: { layout: 'empty', guestOnly: true } // Only guests (unauthenticated users) can access this
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

// Navigation guard to handle authentication and redirection based on role
router.beforeEach((to, from) => {
  const isAuthenticated = !!localStorage.getItem('jwtToken'); // Check if the user is authenticated
  const userRole = localStorage.getItem('userRole'); // Check the user role (e.g., admin, student)

  // If the route requires authentication and the user is not authenticated, redirect to Login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'Login' };
  }

  // If the route is for guests only and the user is already authenticated, redirect based on role
  if (to.meta.guestOnly && isAuthenticated) {
    const redirectRoute = userRole === 'admin' ? 'Dashboard' : 'Inventory'; // Redirect based on role
    return { name: redirectRoute };
  }

  return true; // Allow the navigation if no conditions are met
});
