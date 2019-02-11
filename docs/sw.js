importScripts('/cmd-project-1-jaar-3/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/064ecc2ed99219e029a3.js",
    "revision": "5a287b72448c2b3e6fbf134eddc79819"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/64744dbd3a53ee5f9702.js",
    "revision": "d0d323f8c18b09698c78a6138c9de3b7"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/84ceaf77e2b689428315.js",
    "revision": "b0a1eeecc100ef12ffe5ea287ef370fb"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/d791d7c36c5c4e3b953d.js",
    "revision": "4e42f77d504ed65c947450539d035e45"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/df89d232e3e148515822.js",
    "revision": "cb8270c114ec326f8276a033392ede67"
  }
], {
  "cacheId": "cmd-project",
  "directoryIndex": "/",
  "cleanUrls": false
})

workbox.clientsClaim()
workbox.skipWaiting()

workbox.routing.registerRoute(new RegExp('/cmd-project-1-jaar-3/_nuxt/.*'), workbox.strategies.cacheFirst({}), 'GET')

workbox.routing.registerRoute(new RegExp('/cmd-project-1-jaar-3/.*'), workbox.strategies.networkFirst({}), 'GET')
