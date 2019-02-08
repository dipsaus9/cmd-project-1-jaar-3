importScripts('/cmd-project-1-jaar-3/_nuxt/workbox.4c4f5ca6.js')

workbox.precaching.precacheAndRoute([
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/13b16623c5be8a333941.js",
    "revision": "1442fe279b4c0845d06c4cc365a3a0af"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/1fdc06386fbe30b38500.js",
    "revision": "b2279dc60d5adcb8afdebdffd3fc2860"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/47ae49efe8c2e45b0ebd.js",
    "revision": "7fbaefaa70c73baaee894a00b9f1efa6"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/6ec24fb8fd8146ac8839.js",
    "revision": "1222e44754cc977853671facfbe4f72d"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/948d9a98a4822acab7c8.js",
    "revision": "802f58b667ee5153646cdd31f16cf36b"
  },
  {
    "url": "/cmd-project-1-jaar-3/_nuxt/9554ae1142fb5fcbce58.js",
    "revision": "1f4421c1cde05204723d57075212561e"
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
