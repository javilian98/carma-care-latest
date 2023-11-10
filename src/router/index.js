import { createRouter, createWebHistory, useRoute } from 'vue-router'

// Views
import GiveawaysView from '@/views/Giveaways/GiveawaysView.vue'
import CreateEditGiveawayView from '@/views/Giveaways/CreateEditGiveawayView.vue'
import GiveawayDetailView from '@/views/Giveaways/GiveawayDetailView.vue'

import RequestsView from '@/views/Requests/RequestsView.vue'
import CreateEditRequestView from '@/views/Requests/CreateEditRequestView.vue'
import RequestDetailView from '@/views/Requests/RequestDetailView.vue'

import ProfileView from '@/views/Profile/ProfileView.vue'
import CreateEditProfileView from '@/views/Profile/CreateEditProfileView.vue'

import ChatroomView from '@/views/Chatroom/ChatroomView.vue'

import AuthView from '@/views/Auth/AuthView.vue'

// layouts
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// stores
import { useUserStore } from '../stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    document.getElementById('app').scrollIntoView()
  },
  routes: [
    {
      path: '/',
      name: 'Giveaways',
      component: GiveawaysView,
      meta: {
        layout: DefaultLayout
      }
    },
    {
      path: '/giveaways/:id',
      name: 'Giveaway Detail',
      component: GiveawayDetailView,
      meta: {
        layout: DefaultLayout
        // requiresAuth: true
        // requiresProfile: true
      }
    },
    {
      path: '/giveaways/create',
      name: 'Create Giveaway',
      component: CreateEditGiveawayView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
      }
    },
    {
      path: '/giveaways/edit/:id',
      name: 'Edit Giveaway',
      component: CreateEditGiveawayView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
      }
    },

    {
      path: '/requests',
      name: 'Requests',
      component: RequestsView,
      meta: {
        layout: DefaultLayout
      }
    },
    {
      path: '/requests/:id',
      name: 'Request Detail',
      component: RequestDetailView,
      meta: {
        layout: DefaultLayout
        // requiresAuth: true
        // requiresProfile: true
      }
    },
    {
      path: '/requests/create',
      name: 'Create Request',
      component: CreateEditRequestView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
      }
    },
    {
      path: '/requests/edit/:id',
      name: 'Edit Request',
      component: CreateEditRequestView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
      }
    },

    {
      path: '/profile/:handle',
      name: 'Profile',
      component: ProfileView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
      }
    },
    {
      path: '/profile/create',
      name: 'Create Profile',
      component: CreateEditProfileView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: false
        // alreadyHaveProfile: true
      }
    },
    {
      path: '/profile/:handle/edit',
      name: 'Edit Profile',
      component: CreateEditProfileView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
        // alreadyHaveProfile: true
      }
    },

    {
      path: '/chatroom',
      name: 'Chatroom',
      component: ChatroomView,
      meta: {
        layout: DefaultLayout,
        requiresAuth: true,
        requiresProfile: true
      }
    },

    {
      path: '/login',
      name: 'Login',
      component: AuthView,
      meta: {
        layout: DefaultLayout,
        alreadyHaveAccount: true
      }
    },
    {
      path: '/signup',
      name: 'Signup',
      component: AuthView,
      meta: {
        layout: DefaultLayout,
        alreadyHaveAccount: true
      }
    }

    // {
    //   path: '/requests',
    //   name: 'Requests',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

async function getUser(next, key, redirectPath, toFullPath) {
  const user = useUserStore()
  user.profile = await user.fetchUserProfile()
  console.log('user ', user['profile'] === null)

  if (toFullPath === '/profile/create' && user['profile'] !== null) {
    console.log('log:1')
    next('/')
  } else if (user[key] === null) {
    console.log('log:2')
    next(redirectPath)
  } else {
    console.log('log:3')
    next()
  }
}

async function getUserProfile(next, toFullPath) {
  const user = useUserStore()
  if (user.currentUser === null) {
    next('/login')
  }

  user.profile = await user.fetchUserProfile()

  console.log('user profile ', user.profile)

  // if (user.profile === null) {
  //   next('/profile/create')
  //   return
  // }

  // if (user.currentUser && user.profile && toFullPath !== '/profile/create') {
  //   next()
  // } else {
  //   console.log('NO PROFILE')
  //   next('/')
  // }
}

// auth requirements
router.beforeEach((to, from, next) => {
  const currentUrl = from.fullPath

  console.log('beforEach: ', to)

  console.log(currentUrl)
  if (to.meta.alreadyHaveProfile) {
    getUserProfile(next, to.fullPath)
  } else if (to.meta.requiresProfile) {
    getUser(next, 'profile', '/profile/create', to.fullPath)
  } else if (to.meta.requiresAuth) {
    getUser(next, 'currentUser', '/login', to.fullPath)
  } else if (to.fullPath === '/login' || to.fullPath === '/signup') {
    const user = useUserStore()
    if (user.session !== null) {
      next('/')
    } else {
      next()
    }
  } else if (to.fullPath === '/profile/create') {
    const user = useUserStore()
    user.fetchUserProfile().then((data) => {
      user.profile = data
    })
    console.log('user ', user.profile === null)

    if (user['profile'] === null) {
      next('/profile/create')
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
