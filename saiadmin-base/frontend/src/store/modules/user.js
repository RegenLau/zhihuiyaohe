import { defineStore } from 'pinia'
import loginApi from '@/api/login'
import tool from '@/utils/tool'
import router from '@/router'
import homePageRoutes from '@/router/homePageRoutes'
import { useAppStore, useTagStore, useDictStore } from '@/store'

const defaultUserSetting = {
  mode: 'light',
  menuCollapse: false,
  tag: true,
  roundOpen: true,
  ws: false,
  menuWidth: 230,
  layout: 'classic',
  skin: 'mine',
  color: '#165dff',
  waterMark: false,
  waterContent: '智慧药盒后台'
}

const useUserStore = defineStore('user', {
  state: () => ({
    codes: undefined,
    roles: undefined,
    routers: undefined,
    user: undefined,
    menus: undefined
  }),

  getters: {
    getState() {
      return { ...this.$state }
    }
  },

  actions: {
    setToken(token) {
      tool.local.set(import.meta.env.VITE_APP_TOKEN_PREFIX, token)
    },

    getToken() {
      return tool.local.get(import.meta.env.VITE_APP_TOKEN_PREFIX)
    },

    clearToken() {
      tool.local.remove(import.meta.env.VITE_APP_TOKEN_PREFIX)
    },

    setInfo(data) {
      this.$patch(data)
    },

    resetUserInfo() {
      this.$reset()
    },

    setLocalMenu() {
      this.routers = removeButtonMenu(cloneRoutes(homePageRoutes))
    },

    requestUserInfo() {
      return new Promise((resolve, reject) => {
        loginApi.getInfo().then(async (response) => {
          if (!response || !response.data) {
            this.clearToken()
            await router.push({ name: 'login' })
            reject(false)
          } else {
            const user = normalizeUserPayload(response.data)
            this.setInfo(user)
            const dictStore = useDictStore()
            await dictStore.initData()
            this.setLocalMenu()
            await this.setApp()
            resolve(response.data)
          }
        })
      })
    },

    login(form) {
      return loginApi
        .login(form)
        .then((r) => {
          if (r.code === 200) {
            this.setToken(r.data.access_token)
            return true
          } else {
            return false
          }
        })
        .catch((e) => {
          console.error(e)
          return false
        })
    },

    async logout() {
      // await loginApi.logout()
      const tagStore = useTagStore()
      tool.local.remove('tags')
      tagStore.clearTags()
      this.clearToken()
      this.resetUserInfo()
    },

    async setApp() {
      const appStore = useAppStore()
      const setting =
        typeof this.user.backend_setting === 'string'
          ? JSON.parse(this.user.backend_setting)
          : this.user.backend_setting
      appStore.toggleMode(setting?.mode ?? appStore.mode)
      appStore.toggleMenu(setting?.menuCollapse ?? appStore.menuCollapse)
      appStore.toggleTag(setting?.tag ?? appStore.tag)
      appStore.toggleRound(setting?.roundOpen ?? appStore.roundOpen)
      appStore.toggleWs(setting?.ws ?? appStore.ws)
      appStore.changeMenuWidth(setting?.menuWidth ?? appStore.menuWidth)
      appStore.changeLayout(setting?.layout ?? appStore.layout)
      appStore.useSkin(setting?.skin ?? appStore.skin)
      appStore.changeColor(setting?.color ?? appStore.color)
      appStore.toggleWater(setting?.waterMark ?? appStore.waterMark)
      appStore.changeWaterContent(
        setting?.waterContent ?? appStore.waterContent
      )
    }
  }
})

const normalizeUserPayload = (data) => {
  const rawUser = data.user || data
  const backendSetting = rawUser.backend_setting || defaultUserSetting
  return {
    codes: data.codes || data.buttons || ['*'],
    roles: data.roles || ['superAdmin'],
    user: {
      ...rawUser,
      realname: rawUser.realname || rawUser.username || 'Demo Admin',
      backend_setting:
        typeof backendSetting === 'string'
          ? backendSetting
          : JSON.stringify({ ...defaultUserSetting, ...backendSetting })
    },
    menus: [],
    routers: []
  }
}

const cloneRoutes = (routes) => {
  return routes.map((route) => ({
    ...route,
    meta: { ...route.meta },
    children: route.children ? cloneRoutes(route.children) : undefined
  }))
}

// 去除按钮菜单
const removeButtonMenu = (routers) => {
  let handlerAfterRouters = []
  routers.forEach((item) => {
    if (item.meta.type !== 'B' && !item.meta.hidden) {
      let route = item
      if (item.children && item.children.length > 0) {
        route.children = removeButtonMenu(item.children)
      }
      handlerAfterRouters.push(route)
    }
  })
  return handlerAfterRouters
}
export default useUserStore
