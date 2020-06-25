import { Helpers } from '../../utils/helpers.js'
import { DataSource } from '../../utils/datasource'
import Vue from 'vue'

export default {
  namespaced: true,

  state: {
    items: [],
    currentPath: '/',
    currentPathName: '/',
    currentMediaId: '',
    currentMedia: '',
    mediaList: [],
    deviceLoadedInstruments: [null, null, null, null, null, null, null, null]

  },

  getters: {
    items: state => `${state.items}`,
    currentPath: state => `${state.currentPath}`,
    currentMediaId: state => `${state.currentMediaId}`,
    currentMedia: state => `${state.currentMedia}`,
    mediaList: state => `${state.mediaList}`,
    deviceLoadedInstruments: state => `${state.deviceLoadedInstruments}`
  },

  mutations: {
    updateItems (state, items) {
      state.items = items
    },
    updateCurrentPath (state, path) {
      state.currentPath = path
    },
    updateCurrentPathName (state, path) {
      state.currentPathName = path
    },
    updateCurrentMediaId (state, id) {
      state.currentMediaId = id
      state.currentMedia = state.mediaList.find(item => { return item.id === state.currentMediaId }).name
    },
    updateMediaList (state) {
      // ToDo change so that DataSource will call action..
      state.mediaList = DataSource.getMediaList()
    },
    updateDeviceLoadedInstruments (state, instruments) {
      state.deviceLoadedInstruments = instruments
    },
    updateDeviceLoadedInstrument (state, data) {
      console.log(data)
      Vue.set(state.deviceLoadedInstruments, data.pos - 1, data.name)
    }

  },

  actions: {
    updateItems (context, items) {
      context.commit('updateItems', items)
    },

    updateCurrentPath (context, path) {
      context.commit('updateCurrentPath', path)
    },

    updateCurrentMediaId (context, id) {
      context.commit('updateCurrentMediaId', id)
    },

    updateMediaList (context) {
      context.commit('updateMediaList')
    },

    updateDeviceLoadedInstruments (context, instruments) {
      context.commit('updateDeviceLoadedInstruments', instruments)
    },

    goDir ({commit, state}, dirId) {
      var name
      if (dirId === '..') {
        // parent dir
        commit('updateCurrentPath', Helpers.parent_dir(state.currentPath))
        commit('updateCurrentPathName', Helpers.parent_dir(state.currentPathName))
      } else {
        if (dirId === '/') {
          // root dir
          commit('updateCurrentPath', '/')
          commit('updateCurrentPathName', '/')
        } else if (state.currentPath === '/') {
          // from root dir
          commit('updateCurrentPath', '/' + dirId)
          name = state.items.find(function (item) { return item.index === dirId }).name.trim()
          commit('updateCurrentPathName', '/' + Helpers.capital_letter(name))
        } else {
          // "normal" case
          commit('updateCurrentPath', state.currentPath + '/' + dirId)
          name = state.items.find(function (item) { return item.index === dirId }).name.trim()
          commit('updateCurrentPathName', state.currentPathName + '/' + Helpers.capital_letter(name))
        }
      }
      DataSource.getDirectoryInfoFromEnsoniaMedia(state.currentPath).then(items => { commit('updateItems', items) })
    },

    goParentDir ({commit, state}) {
      commit('updateCurrentPath', Helpers.parent_dir(state.currentPath))
      commit('updateCurrentPathName', Helpers.parent_dir(state.currentPathName))
      DataSource.getDirectoryInfoFromEnsoniaMedia(state.currentPath).then(items => { commit('updateItems', items) })
    }
  }
}
