import { createRouter, createWebHistory } from 'vue-router'
import Profile from '../views/Profile.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import HelpSupport from '../views/HelpSupport.vue'
import History from '../views/History.vue'
import Game from '../views/Game.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import Elites from '../views/Elites.vue'
import AdminHistory from '../views/AdminHistory.vue'
import OfficialMembers from '../views/OfficialMembers.vue'
import AdminHelpSupport from '../views/AdminHelpSupport.vue'
import DepositSuccess from '../views/DepositSuccess.vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, getDoc } from 'firebase/firestore'
import { app } from '../firebase'

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
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/elites',
    name: 'Elites',
    component: Elites,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/history',
    name: 'AdminHistory',
    component: AdminHistory,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/members',
    name: 'OfficialMembers',
    component: OfficialMembers,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/support',
    name: 'AdminHelpSupport',
    component: AdminHelpSupport,
    meta: { requiresAdmin: true }
  },
  {
    path: '/admin/profile',
    name: 'AdminProfile',
    component: () => import('../views/AdminProfile.vue'),
    meta: { requiresAdmin: true }
  },
  {
    path: '/HelpSupport',
    name: 'HelpSupport',
    component: HelpSupport
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
    path: '/deposit-success',
    name: 'DepositSuccess',
    component: DepositSuccess
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for admin routes
router.beforeEach(async (to, from, next) => {
  const auth = getAuth(app)
  const db = getFirestore(app)

  // Check if the route requires admin access
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    console.log('Checking admin access for route:', to.path); // Debug log
    
    // Wait for auth state to be determined
    await new Promise(resolve => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe()
        if (!user) {
          console.log('No user found, redirecting to login'); // Debug log
          next({ name: 'Login' })
          resolve()
          return
        }

        try {
          // Check if user is admin
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          console.log('User document in router guard:', userDoc.data()); // Debug log
          
          if (!userDoc.exists() || userDoc.data().isAdmin !== true) {
            console.log('User is not admin, redirecting to dashboard'); // Debug log
            next({ name: 'Dashboard' })
            resolve()
            return
          }
          console.log('User is admin, allowing access'); // Debug log
          next()
          resolve()
        } catch (error) {
          console.error('Error checking admin status:', error)
          next({ name: 'Dashboard' })
          resolve()
        }
      })
    })
  } else {
    // Route doesn't require admin access
    next()
  }
})

export default router

