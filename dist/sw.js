importScripts('/cmd-project-1-jaar-3/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/6df59e2be732d951f0eb.js",
    "revision": "8def3cebe68a4a868b53b812473c894b"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/6ec24fb8fd8146ac8839.js",
    "revision": "1222e44754cc977853671facfbe4f72d"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/7a37b40d239ef7c8f4e8.js",
    "revision": "f40d5a725c03a8532bf03df0a57dcee2"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/90ef8647e9e406b58e19.js",
    "revision": "aa75b85dd486d0a1a60e4e209bbee7d4"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/936dbcfe1d27f587dbb5.js",
    "revision": "179366aa3a8cba1138471ec1a2e6ee39"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/c222c6f7dea8ae1215d9.js",
    "revision": "72dde96b9ec1de3e2fbe445d881256c4"
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
