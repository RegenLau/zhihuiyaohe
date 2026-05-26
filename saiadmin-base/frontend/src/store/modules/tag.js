import { defineStore } from 'pinia'
import tool from '@/utils/tool'

const defaultTag = [ { name: 'SmartDashboard', title: '工作台', path: '/doctor/dashboard', affix: true } ]

const normalizeTags = (tags = []) => {
  const nextTags = tags
    .map(item => {
      if (item.path === '/dashboard' || item.name === 'dashboard') {
        return { ...defaultTag[0] }
      }
      if (item.path === '/doctor/settings' || item.name === 'SmartSettings') {
        return { name: 'SmartConsentSettings', title: '知情同意书设置', path: '/doctor/settings/consent', affix: item.affix }
      }
      return item
    })
    .filter(item => item.path)

  const uniqueTags = []
  nextTags.forEach(item => {
    if (!uniqueTags.some(tag => tag.path === item.path)) {
      uniqueTags.push(item)
    }
  })

  if (!uniqueTags.some(item => item.path === defaultTag[0].path)) {
    uniqueTags.unshift(defaultTag[0])
  }

  return uniqueTags
}

const getInitialTags = () => {
  const storedTags = tool.local.get('tags')
  if (!storedTags || storedTags.length === 0) {
    tool.local.set('tags', defaultTag)
    return defaultTag
  }
  const normalizedTags = normalizeTags(storedTags)
  tool.local.set('tags', normalizedTags)
  return normalizedTags
}

const useTagStore = defineStore('tag', {
  state: () => ({
    tags: getInitialTags()
  }),

  getters: {
    getState() {
      return { ...this.$state }
    },
  },

  actions: {

    addTag(tag) {
      const target = this.tags.find( item => item.path === tag.path )
      if (! target && tag.path ) {
        this.tags.push(tag)
      }
      this.updateTagsToLocal()
    },

    removeTag(tag) {
      let index = 0
      this.tags.map((item, idx) => {
        if ( item.path === tag.path && ! item.affix ) {
          if (this.tags[(idx + 1)]) {
            index = idx
          } else if ( idx > 0) {
            index = idx - 1
          }
          this.tags.splice(idx, 1)
        }
      })
      this.updateTagsToLocal()
      return this.tags[index]
    },

    updateTag(tag) {
      this.tags.map(item => {
        if (item.path == tag.path) {
          item = Object.assign(item, tag)
        }
      })
      this.updateTagsToLocal()
    },

    updateTagTitle(path, title) {
      this.tags.map(item => {
        if (item.path == path) {
          item.customTitle = title
        }
      })
      this.updateTagsToLocal()
    },

    updateTagsToLocal() {
      tool.local.set('tags', this.tags)
    },

    clearTags() {
      this.tags = defaultTag
      tool.local.set('tags', defaultTag)
    },
  },
})

export default useTagStore
